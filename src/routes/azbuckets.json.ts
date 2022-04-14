import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import type { ServiceListContainersOptions } from '@azure/storage-blob'

import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables'
import type { Bucket } from '../lib/types'
import { BucketType } from '$lib/constants'

const account = AZURE_STORAGE_ACCOUNT
const accountKey = AZURE_STORAGE_ACCESS_KEY
const listContainerOpts: ServiceListContainersOptions = { includeMetadata: true }
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey)

const listContainers = async () => {
  const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential)
  const bucketList: Array<Bucket> = []

  for await (const container of blobServiceClient.listContainers(listContainerOpts)) {
    if (container.metadata && 'published' in container.metadata && container.metadata.published) {
      let tags: Array<string> = []
      if (!container.metadata.tags.includes(',')) {
        tags.push(container.metadata.tags)
      } else {
        tags = container.metadata.tags.split(',').map((item) => item.trim())
      }
      const bucket: Bucket = {
        id: container.properties.lastModified.valueOf().toString(),
        published: Boolean(container.metadata.published),
        path: `${container.name}/`,
        label: container.metadata.label,
        description: container.metadata.description || '',
        icon: container.metadata.icon || null,
        type: BucketType.INTERNAL,
        tags: tags,
      }

      bucketList.push(bucket)
    }
  }

  return bucketList
}

export async function get() {
  return {
    body: await listContainers(),
  }
}
