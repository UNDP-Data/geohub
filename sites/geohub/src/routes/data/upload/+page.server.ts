import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob'
import crypto from 'crypto'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/server/variables/private'

export const actions = {
  /**
   * An action to get SAS URL for data uploading
   */
  getSasUrl: async (event) => {
    try {
      const session = await event.locals.getSession()
      if (!session) {
        return fail(403, { message: 'No permission' })
      }
      const user_email = session?.user.email
      const containerName = 'data-upload'
      const fileName = (await event.request.formData()).get('fileName') as string
      const sasUrl = await getSasUrl(user_email, containerName, fileName)
      return { sasUrl }
    } catch (error) {
      return fail(500, { status: error.status, message: 'error:' + error.message })
    }
  },
} satisfies Actions

async function getSasUrl(userId: string, containerName: string, fileName: string) {
  const containerClient = getContainerClient(containerName)

  // save file in user email folder
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(
    userId + '/' + crypto.randomUUID() + '_' + fileName,
  )

  return blockBlobClient.generateSasUrl({
    // allow user to write
    permissions: BlobSASPermissions.from({
      write: true,
    }),

    // expired in an hour
    expiresOn: new Date(new Date().setHours(new Date().getHours() + 1)),
  })
}

function getContainerClient(containerName: string) {
  const blobServiceClient = getBlobServiceClient()
  const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName)
  return containerClient
}

function getBlobServiceClient() {
  if (!AZURE_STORAGE_ACCOUNT || !AZURE_STORAGE_ACCESS_KEY) {
    throw Error('Azure Storage credentials not found')
  }
  const baseUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`

  const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
  const blobServiceClient: BlobServiceClient = new BlobServiceClient(baseUrl, sharedKeyCredential)

  return blobServiceClient
}
