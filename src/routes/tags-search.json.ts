import fs from 'fs'
import path from 'path'
// import Redis from 'ioredis'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'

import {
  AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_ACCESS_KEY,
  // AZURE_REDIS_HOSTNAME,
  // AZURE_REDIS_CACHEKEY,
} from '$lib/variables'
import { TagKeys } from '$lib/constants'
import type { TagLayer } from '$lib/types'

const __dirname = path.resolve()
const tagsFile = `${__dirname}/data/tags.json`
const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  sharedKeyCredential,
)

export async function get({ url }) {
  const containers = new Set()
  console.clear()
  const startTime = performance.now()
  const blobs = []
  let tagsFilteredParam = []

  // const redis = new Redis(`rediss://:${AZURE_REDIS_CACHEKEY}@${AZURE_REDIS_HOSTNAME}:6380`)

  // get tags parameter
  if (url.searchParams.get('tags')) {
    const tagsParam = url.searchParams.get('tags').split(',')

    // check for param and tags file
    if (tagsParam.length > 0 && fs.existsSync(tagsFile)) {
      const tagsFromFile = JSON.parse(fs.readFileSync(tagsFile, 'utf8'))

      // filter tag param not in tags file
      tagsFilteredParam = tagsFromFile.filter((tag: string) => tagsParam.includes(tag))

      for (const tag of tagsFilteredParam) {
        for (const tagKey of TagKeys) {
          // const data = JSON.parse(await redis.get(`${tagKey}='${tag}'`))
          const tagKeyBlobs = []

          // if (data === null) {
          //   tagKeyBlobs = []

          for await (const blob of blobServiceClient.findBlobsByTags(`${tagKey}='${tag}'`)) {
            containers.add(blob.containerName)
            const containerClient = blobServiceClient.getContainerClient(blob.containerName)
            const tags = await containerClient.getBlobClient(blob.name).getTags()

            let isVector = false
            let blobName = blob.name

            if (blob.name.endsWith('metadata.json')) {
              isVector = true
              blobName = blob.name.split('/').at(-2)
            }

            tagKeyBlobs.push({
              name: blobName,
              container: blob.containerName,
              tags: tags.tags,
              isVector,
            })
          }

          // await redis.setex(`${tagKey}='${tag}'`, 120, JSON.stringify(tagKeyBlobs))
          // } else {
          //   tagKeyBlobs = data
          // }

          tagKeyBlobs.forEach((tagKeyBlob: TagLayer) => {
            blobs.push(tagKeyBlob)
            containers.add(tagKeyBlob.container)
          })
        }
      }
    }
  }

  // await redis.disconnect()

  const endTime = performance.now()
  console.log(`    `)
  console.log(blobs)
  console.log(`    `)
  console.log(`-------------- ${((endTime - startTime) / 1000).toFixed(2)} seconds`)

  return {
    body: {
      tags: tagsFilteredParam,
      blobCount: blobs.length,
      containerCount: [...containers].length,
      results: {
        blobs: blobs,
        containers: [...containers].sort(),
      },
      responseTime: endTime - startTime,
    },
  }
}
