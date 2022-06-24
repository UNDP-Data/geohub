import fs from 'fs'
import path from 'path'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import type { ServiceListContainersOptions } from '@azure/storage-blob'

import { BucketType } from '$lib/constants'
import type { Bucket } from '$lib/types'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables'

const account = AZURE_STORAGE_ACCOUNT
const accountKey = AZURE_STORAGE_ACCESS_KEY
const listContainerOpts: ServiceListContainersOptions = { includeMetadata: true }
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey)
const __dirname = path.resolve()

export async function get() {
  const stacContainers = getStacContainers()
  const buckets = await listContainers()

  return {
    body: {
      buckets: [...stacContainers, ...buckets],
    },
  }
}

const listContainers = async () => {
  const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential)
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

      const bucket: Bucket = {
        id: container.properties.lastModified.valueOf().toString(),
        published: Boolean(container.metadata.published),
        path: `${container.name}/`,
        label: container.metadata.label,
        description: container.metadata.description || '',
        icon: container.metadata.icon || null,
        type: BucketType.INTERNAL,
        tags,
        selected: false,
      }

      bucketList.push(bucket)
    }
  }

  bucketList.sort((a, b) => a.label !== undefined && a.label.localeCompare(b.label))

  return bucketList
}

const getStacContainers = () => {
  let containers = []
  const filePath = `${__dirname}/data/stac.json`

  if (fs.existsSync(filePath)) {
    containers = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    if (containers.length > 0) {
      containers.sort((a: Bucket, b: Bucket) => a.label.localeCompare(b.label))
    }
  }

  return containers
}
