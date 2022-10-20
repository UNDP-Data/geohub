import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables/private'
const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)

export const GET: RequestHandler = async ({ url }) => {
  const file = url.searchParams.get('file')
  if (!file) {
    throw error(400, 'file parameter is required.')
  }
  const target = file.split('/')
  if (target.length < 2) {
    throw error(400, 'Invalid file path. Should container both container name and file name connected with slash')
  }
  const containerName = target[0]
  const blobName = target[1]

  // create storage container
  const blobServiceClient = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
    sharedKeyCredential,
  )

  // const containerName = 'mosaicjson'
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = await containerClient.getBlobClient(blobName)
  const downloadResponse = await blobClient.download()
  const downloaded = await streamToBuffer(downloadResponse.readableStreamBody)
  // const res = await fetch(mosaicJsonUrl)
  // const mosaicjson = await res.json

  return new Response(downloaded.toString())
}

const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = []
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    })
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on('error', reject)
  })
}
