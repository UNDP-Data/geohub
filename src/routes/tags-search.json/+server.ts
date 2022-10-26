import type { RequestHandler } from './$types'
import fs from 'fs'
import path from 'path'
import NodeCache from 'node-cache'
import {
  AccountSASPermissions,
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables/private'
import { TagKeys } from '$lib/constants'
import { fetchUrl } from '$lib/helper'
import type { TagLayer } from '$lib/types'

const nodeCache = new NodeCache()
const __dirname = path.resolve()
const tagsFile = `${__dirname}/data/tags.json`
const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  sharedKeyCredential,
)

export const GET: RequestHandler = async ({ url }) => {
  const containers = new Set()
  console.clear()
  const startTime = performance.now()
  const blobs = []
  let tagsFilteredParam = []
  const accountSasTokenUri = blobServiceClient.generateAccountSasUrl(
    new Date(new Date().valueOf() + 86400000),
    AccountSASPermissions.parse('r'),
    'o',
  )

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
          const cacheValue = nodeCache.get(`${tagKey}='${tag}'`) as string
          let tagKeyBlobs = []

          // check for cached key/value
          if (cacheValue) {
            tagKeyBlobs = JSON.parse(cacheValue)
          } else {
            tagKeyBlobs = []

            for await (const blob of blobServiceClient.findBlobsByTags(`${tagKey}='${tag}'`)) {
              containers.add(blob.containerName)
              const containerClient = blobServiceClient.getContainerClient(blob.containerName)
              const tags = await containerClient.getBlobClient(blob.name).getTags()
              const sasToken = generateBlobSASQueryParameters(
                {
                  containerName: blob.containerName,
                  blobName: blob.name,
                  expiresOn: new Date(new Date().valueOf() + 86400000),
                  permissions: BlobSASPermissions.parse('r'),
                },
                sharedKeyCredential,
              )

              let isRaster = true
              let path = `${blob.containerName}/${blob.name}`
              let label = path.split('/')[path.split('/').length - 1]
              let geomType = null
              let url = `${`https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`}/${path}?${sasToken}`

              // vector blob
              if (blob.name.endsWith('metadata.json')) {
                const vectorLayerInfo = await fetchUrl(url)
                const accountSasTokenUrl = new URL(accountSasTokenUri)

                if (vectorLayerInfo?.json) {
                  const vectorTileMeta = JSON.parse(vectorLayerInfo.json)
                  geomType = vectorTileMeta.tilestats.layers[0].geometry
                }

                isRaster = false
                label = blob.name.split('/').at(-2)
                url = `${`https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`}/${path.replace(
                  'metadata.json',
                  '{z}/{x}/{y}.pbf',
                )}${accountSasTokenUrl.search}`
                path = path.replace('metadata.json', '')
              }

              const tag = {
                label,
                path,
                url,
                isRaster,
                geomType,
                container: blob.containerName,
                tags: tags.tags,
              }

              if (isRaster) {
                delete tag.geomType
              }

              tagKeyBlobs.push(tag)
            }

            // save tags to cache
            nodeCache.set(`${tagKey}='${tag}'`, JSON.stringify(tagKeyBlobs), 60 * 60)
          }

          tagKeyBlobs.sort((a, b) => a.label.localeCompare(b.label))

          tagKeyBlobs.forEach((tagKeyBlob: TagLayer) => {
            blobs.push(tagKeyBlob)
            containers.add(tagKeyBlob.container)
          })
        }
      }
    }
  }

  const endTime = performance.now()
  console.log(`    `)
  console.log(blobs)
  console.log(`    `)
  console.log(`-------------- ${((endTime - startTime) / 1000).toFixed(2)} seconds`)

  return new Response(
    JSON.stringify({
      tags: tagsFilteredParam,
      blobCount: blobs.length,
      containerCount: [...containers].length,
      results: {
        blobs: blobs,
        containers: [...containers].sort(),
      },
      responseTime: endTime - startTime,
    }),
  )
}
