import type { RequestHandler } from './$types'
import fs from 'fs'
import path from 'path'
import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
import { STAC_PAGINATION_PREV, STAC_PAGINATION_NEXT, STAC_PAGINATION_LIMIT } from '$lib/constants'
import { fetchUrl, getBase64EncodedUrl } from '$lib/helper'
import type { TreeNode } from '$lib/types'

const __dirname = path.resolve()
const COG_MIME_TYPE = 'image/tiff; application=geotiff; profile=cloud-optimized'

export const GET: RequestHandler = async ({ url }) => {
  const startTime = performance.now()
  let tree: TreeNode = {}

  const catalogues = JSON.parse(fs.readFileSync(`${__dirname}/data/stac.json`, 'utf8'))
  const stacIds = catalogues.map((catalog) => catalog.id)
  const catalogId = url.searchParams.get('id')
  const containerPath = url.searchParams.get('path')

  if (catalogId && stacIds.includes(catalogId) && containerPath.startsWith(catalogId)) {
    // get root
    tree = getStacFileData(`stac-${catalogId}.json`) as TreeNode
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    tree.children = tree.children.sort((a, b) => a.label.localeCompare(b.label))

    if (containerPath !== catalogId + '/') {
      const container = tree.children.find((node: TreeNode) => node.path === containerPath)
      const res = await fetchUrl(`https://planetarycomputer.microsoft.com/api/sas/v1/token/${container.id}`)
      const catalog = catalogues.find((catalog) => catalog.id === catalogId)
      const collectionLayers = new Map()

      let token = ''
      let paginationDirectionDisabled = ''

      if (
        url.searchParams.get('token') &&
        (url.searchParams.get('token') === STAC_PAGINATION_PREV ||
          url.searchParams.get('token') === STAC_PAGINATION_NEXT)
      ) {
        token = `&token=${url.searchParams.get('token')}:${url.searchParams.get('item')}`
      }

      let containerItems = await fetchUrl(`${catalog.url}/${container.id}/items?limit=${STAC_PAGINATION_LIMIT}${token}`)

      // token / item invalid, set to first page
      if (
        Object.prototype.hasOwnProperty.call(containerItems, 'features') === false ||
        containerItems.features.length === 0
      ) {
        containerItems = await fetchUrl(`${catalog.url}/${container.id}/items?limit=${STAC_PAGINATION_LIMIT}`)

        if (url.searchParams.get('token') === STAC_PAGINATION_PREV) {
          paginationDirectionDisabled = STAC_PAGINATION_PREV
        }

        if (url.searchParams.get('token') === STAC_PAGINATION_NEXT) {
          paginationDirectionDisabled = STAC_PAGINATION_NEXT
        }
      }

      // get all COG for features
      for (const feat of containerItems.features) {
        const assets = feat.assets

        for (const assetKey of Object.keys(assets)) {
          if (assets[assetKey].type === COG_MIME_TYPE) {
            const assetItem = assets[assetKey]
            if (!assetItem.href) continue
            const file = new URL(assetItem.href).pathname.split('/').pop()
            const path = `${catalog.id}/${container.id}/${file}`
            const url = `${assetItem.href}?${res.token}`

            const b64EncodedUrl = getBase64EncodedUrl(url)
            const resTitiler = await fetch(`${PUBLIC_TITILER_ENDPOINT}/bounds?url=${b64EncodedUrl}`)
            if (resTitiler.status === 500) {
              // some COG is invalid to use. skip to add the data if titiler api returns 500.
              continue
            }

            const layer: TreeNode = {
              label: feat.id,
              path,
              url: url,
              isRaster: true,
              isStac: true,
              collectionUrl: catalog.url,
            }

            if (!collectionLayers.has(path)) {
              collectionLayers.set(path, layer)
            }
          }
        }
      }

      tree = {
        children: Array.from(collectionLayers.values()),
        label: container.label,
        path: container.path,
        url: null,
        isRaster: true,
        isStac: true,
        paginationDirectionDisabled,
      }
    }
  }

  const endTime = performance.now()

  return new Response(
    JSON.stringify({
      tree,
      responseTime: endTime - startTime,
    }),
  )
}

const getStacFileData = (file: string) => {
  const stacFile = `${__dirname}/data/${file}`
  return JSON.parse(fs.readFileSync(stacFile, 'utf8')) as TreeNode[]
}
