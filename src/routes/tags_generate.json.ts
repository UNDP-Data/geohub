import fs from 'fs'
import path from 'path'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import type { ServiceListContainersOptions, BlockBlobClient, BlobClient } from '@azure/storage-blob'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables'
import { performance } from 'perf_hooks'

const __dirname = path.resolve()
const account = AZURE_STORAGE_ACCOUNT
const accountKey = AZURE_STORAGE_ACCESS_KEY
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey)
const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential)
const listContainerOpts: ServiceListContainersOptions = { includeMetadata: true }
let mapTags = new Map()
const excludeContainers = ['test']

export async function get() {
  console.clear()
  const startTime = performance.now()
  let containers = await getRootContainers()
  containers = ['mobility']

  for await (const path of containers) {
    const [containerName, ...containerPath] = path.split('/')
    console.log('------------ CONTAINER ', path)
    await findTagsOfContainer(
      containerName,
      Array.isArray(containerPath) && !!containerPath[0] ? containerPath.join('/') : '',
    )
  }

  mapTags = new Map([...mapTags.entries()].sort())
  fs.writeFileSync(`${__dirname}/static/tags.json`, JSON.stringify(Object.fromEntries(mapTags), null, 2))

  const endTime = performance.now()
  console.log(`    `)
  console.log(Object.fromEntries(mapTags))
  console.log(`    `)
  console.log(`-------------- ${((endTime - startTime) / 1000).toFixed(2)} seconds`)

  return {
    body: Object.fromEntries(mapTags),
  }
}

const getRootContainers = async () => {
  const containers = []

  for await (const container of blobServiceClient.listContainers(listContainerOpts)) {
    if (
      (container.metadata &&
      'published' in container.metadata &&
      container.metadata.published === 'true' &&
      container?.metadata?.label) ||
      !excludeContainers.includes(container.name)
    ) {
      containers.push(container.name)
    }
  }

  return containers
}

const findTagsOfContainer = async (containerName: string, relPath: string) => {
  const containerClient = blobServiceClient.getContainerClient(containerName)

  for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: relPath })) {
    const path = `${containerName}/${item.name}`
    if (item.kind === 'prefix') {
      const blobClient = containerClient.getBlobClient(`${item.name}metadata.json`)
      const isVectorTile: boolean = await blobClient.exists()

      if (isVectorTile) {
        setMapTags(path, blobClient)
      } else {
        const [containerName, ...containerPath] = path.split('/')
        await findTagsOfContainer(
          containerName,
          Array.isArray(containerPath) && !!containerPath[0] ? containerPath.join('/') : '',
        )
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

      console.log(path, tagValues)
    }
  }
}
