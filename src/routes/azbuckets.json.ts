import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import type { Bucket } from '../lib/types'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables'
import type { ServiceListContainersOptions } from '@azure/storage-blob'

import { BucketType } from '$lib/constants'

const account = AZURE_STORAGE_ACCOUNT
const accountKey = AZURE_STORAGE_ACCESS_KEY
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey)

const listContainerOpts: ServiceListContainersOptions = { includeMetadata: true }

const editDistance = (s1: string, s2: string): number => {
  s1 = s1.toLowerCase()
  s2 = s2.toLowerCase()

  const costs = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j
      else {
        if (j > 0) {
          let newValue = costs[j - 1]
          if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

const similarity = (s1: string, s2: string): number => {
  let longer = s1
  let shorter = s2
  if (s1.length < s2.length) {
    longer = s2
    shorter = s1
  }
  const longerLength = longer.length
  if (longerLength == 0) {
    return 1.0
  }
  return (longerLength - editDistance(longer, shorter)) / longerLength
}

const listContainers = async (prefix = '/') => {
  const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential)

  const bucketList: Array<Bucket> = []

  for await (const container of blobServiceClient.listContainers(listContainerOpts)) {
    //tree.children.push({ label: container.name, children: [], path: `${container.name}/`, url: null, isRaster: false })

    if (container.metadata && 'published' in container.metadata && container.metadata.published) {
      const bucket: Bucket = {
        id: container.properties.lastModified.valueOf().toString(),
        published: Boolean(container.metadata.published),
        path: `${container.name}/`,
        name: container.name,
        description: container.metadata.description || '',
        icon: container.metadata.icon || null,
        type: BucketType.INTERNAL,
        tags: container.metadata.tags.split(',').map((item) => {
          return item.trim()
        }),
      }

      bucketList.push(bucket)
    }
  }
  console.log(bucketList)

  return bucketList
}

export async function get(request: Request) {
  return {
    body: await listContainers(),
  }
}
