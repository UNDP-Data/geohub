import fs from 'fs'
import path from 'path'
import { BlobServiceClient, StorageSharedKeyCredential, type ServiceListContainersOptions } from '@azure/storage-blob'

import { BucketType } from '$lib/constants'
import type { Bucket } from '$lib/types'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables/private'
import type { PageServerLoad } from './$types'

const listContainerOpts: ServiceListContainersOptions = { includeMetadata: true }
const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
const __dirname = path.resolve()

export const load: PageServerLoad = async ({ url }) => {
  const stacContainers = getStacContainers()
  const dynamicContainers = getDynamicContainers()
  const mosaicStacContainers = getMosaicStacContainers()
  const buckets = await listContainers(url.origin)

  return {
    buckets: [...stacContainers, ...mosaicStacContainers, ...dynamicContainers, ...buckets],
  }
}

const listContainers = async (urlOrigin: string) => {
  const blobServiceClient = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
    sharedKeyCredential,
  )
  const bucketList: Array<Bucket> = []

  for await (const container of blobServiceClient.listContainers(listContainerOpts)) {
    if (
      container.metadata &&
      'published' in container.metadata &&
      container.metadata.published === 'true' &&
      container?.metadata?.label
    ) {
      let tags: Array<string> = []

      if (container?.metadata?.tags) {
        tags = container.metadata.tags
          .split(',')
          .filter((item) => item !== '')
          .map((item) => item.trim().replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()))
          .sort((a, b) => a.localeCompare(b))
      } else {
        console.error('ERROR: Missing tags parameter')
        console.error(container.metadata)
      }

      let icon: string | undefined = undefined
      if (container.metadata.sdg) {
        icon = `${urlOrigin}/sdgs/${container.metadata.sdg}.png`
      } else if (container.metadata.icon) {
        icon = container.metadata.icon
      }

      const bucket: Bucket = {
        id: container.properties.lastModified.valueOf().toString(),
        published: Boolean(container.metadata.published),
        path: `${container.name}/`,
        label: container.metadata.label,
        description: container.metadata.description || '',
        icon: icon,
        type: BucketType.INTERNAL,
        tags,
        selected: false,
        sdg: container.metadata.sdg ? Number(container.metadata.sdg) : 999,
      }

      bucketList.push(bucket)
    }
  }

  // sort by SDG number. Non SDG buckets are following SDG bucket.
  bucketList.sort((a, b) => {
    return a.sdg < b.sdg ? -1 : 1
  })

  return bucketList
}

const getExternalContainers = (filePath: string) => {
  let containers = []

  if (fs.existsSync(filePath)) {
    containers = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    if (containers.length > 0) {
      containers.sort((a: Bucket, b: Bucket) => a.label.localeCompare(b.label))
    }
  }

  return containers
}

const getStacContainers = () => {
  const filePath = `${__dirname}/data/stac.json`
  return getExternalContainers(filePath)
}

const getDynamicContainers = () => {
  const filePath = `${__dirname}/data/dynamic.json`
  return getExternalContainers(filePath)
}

const getMosaicStacContainers = () => {
  const filePath = `${__dirname}/data/mosaic-stac.json`
  return getExternalContainers(filePath)
}
