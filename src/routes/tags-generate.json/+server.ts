import type { RequestHandler } from './$types'
import fs from 'fs'
import path from 'path'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import type { ServiceListContainersOptions, BlockBlobClient, BlobClient } from '@azure/storage-blob'

import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables/private'

const __dirname = path.resolve()
const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  sharedKeyCredential,
)
const excludeContainers = ['test']
const listContainerOpts: ServiceListContainersOptions = { includeMetadata: true }

let mapTags = new Map()

export const GET: RequestHandler = async ({ url }) => {
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

  let tags = []

  if (url.searchParams.get('showContainers') === 'true') {
    tags = Object.fromEntries(mapTags)
  } else {
    tags = [...new Set(mapTags.keys())]
  }

  tags.sort((a: string, b: string) => a.localeCompare(b))

  fs.writeFileSync(`${__dirname}/data/tags.json`, JSON.stringify(tags, null, 2))

  const endTime = performance.now()
  const responseTime = endTime - startTime
  console.log(`    `)
  console.log(tags)
  console.log(`    `)
  console.log(`-------------- ${(responseTime / 1000).toFixed(2)} seconds`)

  return new Response(
    JSON.stringify({
      tags,
      responseTime,
      date: Math.trunc(Date.now() / 1000),
    }),
  )
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
      // if tag does not exist, add to map
      if (!mapTags.has(tag)) {
        mapTags.set(tag, [path])
      } else {
        // merge pre-existing container(s)
        const containers = [...mapTags.get(tag), path]
        const uniqueSet = new Set(containers)
        mapTags.set(tag, [...uniqueSet])
      }
    }
  }

  console.log(path, tagValues)
}
