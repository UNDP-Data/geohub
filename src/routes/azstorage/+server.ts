import type { RequestHandler } from './$types'
import {
  AccountSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob'

import type { Tree, TreeNode } from '$lib/types'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables/private'
import { fetchUrl } from '$lib/helper'
import { TOKEN_EXPIRY_PERIOD_MSEC } from '$lib/constants'

const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)

const isRasterExtension = (name: string) => {
  const splitAt = name.lastIndexOf('.')
  const ext = name.slice(splitAt, name.length)
  const extensions = ['.tif', '.tiff', '.vrt', '.jpg', '.jpeg', '.img', '.nc']
  const v = extensions.includes(ext.toLowerCase())
  return v
}

const listContainer = async (containerName: string, relPath: string) => {
  // create storage container
  const blobServiceClient = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
    sharedKeyCredential,
  )

  // generate account SAS token for vector tiles. This is needed because the
  // blob level SAS tokens have the blob name encoded inside the SAS token and the
  // adding a vector tile to mapbox requires adding a template/pattern not one file and reading many more files as well.

  const ACCOUNT_SAS_TOKEN_URI = blobServiceClient.generateAccountSasUrl(
    new Date(new Date().valueOf() + TOKEN_EXPIRY_PERIOD_MSEC),
    AccountSASPermissions.parse('r'),
    'o',
  )
  const ACCOUNT_SAS_TOKEN_URL = new URL(ACCOUNT_SAS_TOKEN_URI)

  let treeLabel: string = containerName
  if (relPath) {
    treeLabel = relPath
  }
  const treePath = `${containerName}/${relPath}`

  if (treeLabel.endsWith('/')) {
    treeLabel = treeLabel.slice(0, -1)
  }

  if (treeLabel.includes('/')) {
    treeLabel = treeLabel.split('/').pop()
  }

  const tree: TreeNode = <TreeNode>{ label: treeLabel, children: [], path: treePath, url: null }
  const cclient = blobServiceClient.getContainerClient(containerName)

  const containerChildren: Array<TreeNode> = []

  for await (const item of cclient.listBlobsByHierarchy('/', { prefix: relPath })) {
    let childLabel: string

    const path = `${containerName}/${item.name}`
    if (item.kind === 'prefix') {
      const label = item.name.slice(0, -1)
      if (label.includes('/')) {
        childLabel = label.split('/').pop()
      } else {
        childLabel = label
      }

      const bclient = cclient.getBlobClient(`${item.name}metadata.json`)
      const isVectorTile: boolean = await bclient.exists()

      const url = isVectorTile
        ? `${bclient.url.replace('metadata.json', '{z}/{x}/{y}.pbf')}${ACCOUNT_SAS_TOKEN_URL.search}`
        : null
      // fetch geom type ...there must be a better way to avoid calling get on metadata.json
      let geomType: string
      let children: TreeNode[] | undefined = []
      if (isVectorTile) {
        const vectorLayerInfo = await fetchUrl(`${bclient.url}${ACCOUNT_SAS_TOKEN_URL.search}`)
        children = undefined
        if (vectorLayerInfo?.json) {
          const vectorTileMeta = JSON.parse(vectorLayerInfo.json)
          geomType = vectorTileMeta.tilestats.layers[0].geometry

          if (['point', 'multipoint'].includes(geomType.toLowerCase())) {
            children = []
            ;['heatmap', 'point'].forEach((layerType) => {
              children.push({
                label: `${childLabel}-${layerType}`,
                children: undefined,
                path: path,
                url: url,
                isRaster: false,
                geomType: layerType,
              })
            })
          }
        }
      }
      containerChildren.push({
        label: childLabel,
        children,
        path: path,
        url: children && children.length > 0 ? undefined : url,
        isRaster: false,
        geomType: geomType,
      })
    } else {
      const blockBlobClient = cclient.getBlockBlobClient(item.name)
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: containerName,
          blobName: item.name,
          expiresOn: new Date(new Date().valueOf() + 86400000),
          permissions: BlobSASPermissions.parse('r'),
        },
        sharedKeyCredential,
      )

      const sasUrl = `${blockBlobClient.url}?${sasToken}`
      const label = item.name
      if (label.includes('/')) {
        childLabel = label.split('/').pop()
      } else {
        childLabel = label
      }
      const isRaster = isRasterExtension(childLabel)

      if (isRaster) {
        containerChildren.push({ label: childLabel, path, url: sasUrl, isRaster })
      }
    }
  }

  tree.children = containerChildren

  return {
    tree,
  }
}

export const GET: RequestHandler = async ({ url }) => {
  let path = url.searchParams.get('path')
  if (!path.endsWith('/')) {
    path = `${path}/`
  }

  const [containerName, ...containerPath] = path.split('/')
  const tree: Tree = await listContainer(
    containerName,
    Array.isArray(containerPath) && !!containerPath[0] ? containerPath.join('/') : '',
  )

  return new Response(JSON.stringify(tree))
}
