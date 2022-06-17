import fs from 'fs'
import path from 'path'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import type { ServiceListContainersOptions, BlockBlobClient, BlobClient } from '@azure/storage-blob'

import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables'

const __dirname = path.resolve()
const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  sharedKeyCredential,
)
const excludeContainers = ['test']
const listContainerOpts: ServiceListContainersOptions = { includeMetadata: true }

let mapTags = new Map()
let showContainers = false

export async function get({ url }) {
  console.clear()
  const startTime = performance.now()
  const containers = await getRootContainers()

  for await (const path of containers) {
    console.log('------------ CONTAINER ', path)
    await findTagsOfContainer(path)
  }

  mapTags = new Map([...mapTags.entries()].sort())

  if (!fs.existsSync(`${__dirname}/data`)) {
    fs.mkdirSync(`${__dirname}/data`)
  }

  const paramShowContainers = url.searchParams.get('showContainers')
  if (paramShowContainers && paramShowContainers === 'true') {
    showContainers = true
  }

  const body = showContainers ? Object.fromEntries(mapTags) : [...mapTags.keys()].sort()
  fs.writeFileSync(`${__dirname}/data/tags.json`, JSON.stringify(body, null, 2))

  const endTime = performance.now()
  console.log(`    `)
  console.log(Object.fromEntries(mapTags))
  console.log(`    `)
  console.log(`-------------- ${((endTime - startTime) / 1000).toFixed(2)} seconds`)

  return {
    body,
  }
}

const getRootContainers = async () => {
  const containers = []

  for await (const container of blobServiceClient.listContainers(listContainerOpts)) {
    if (
      !excludeContainers.includes(container.name) &&
      container.metadata &&
      'published' in container.metadata &&
      container.metadata.published === 'true' &&
      container?.metadata?.label
    ) {
      containers.push(container.name)
    }
  }

  return containers
}

const findTagsOfContainer = async (path: string) => {
  const [containerName, ...containerPath] = path.split('/')
  const relPath = Array.isArray(containerPath) && !!containerPath[0] ? containerPath.join('/') : ''
  const containerClient = blobServiceClient.getContainerClient(containerName)

  for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: relPath })) {
    const path = `${containerName}/${item.name}`
    if (item.kind === 'prefix') {
      const blobClient = containerClient.getBlobClient(`${item.name}metadata.json`)
      const isVectorTile: boolean = await blobClient.exists()

      if (isVectorTile) {
        await setMapTags(path, blobClient)
      } else {
        await findTagsOfContainer(path)
      }
    } else if (item.kind === 'blob') {
      const blockBlobClient = containerClient.getBlockBlobClient(item.name)
      await setMapTags(path, blockBlobClient)
    }
  }
}

const setMapTags = async (path: string, blobClient: BlockBlobClient | BlobClient) => {
  const tags = await blobClient.getTags()

  const tagValues = Object.values(tags.tags)

  if (tagValues.length > 0) {
    for (const tag of tagValues) {
      if (!mapTags.has(tag)) {
        mapTags.set(tag, [path])
      } else {
        const containers = [...mapTags.get(tag), path]
        const uniqueSet = new Set(containers)
        mapTags.set(tag, [...uniqueSet])
      }
    }
  }

  console.log(path, tagValues)
}
