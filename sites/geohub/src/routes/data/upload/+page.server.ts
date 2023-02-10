import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob'
import { AZURE_STORAGE_ACCOUNT_UPLOAD, AZURE_STORAGE_ACCESS_KEY_UPLOAD } from '$lib/server/variables/private'
import { generateHashKey } from '$lib/server/helpers'

const CONTAINER_NAME = 'userdata'

export const actions = {
  /**
   * An action to get SAS URL for data uploading
   */
  getSasUrl: async ({ request, locals }) => {
    try {
      const session = await locals.getSession()
      if (!session) {
        return fail(403, { message: 'No permission' })
      }
      const user_email = session?.user.email
      const userHash = generateHashKey(user_email)
      const fileName = (await request.formData()).get('fileName') as string
      const sasUrl = await getSasUrl(userHash, CONTAINER_NAME, fileName)
      return { sasUrl }
    } catch (error) {
      return fail(500, { status: error.status, message: 'error:' + error.message })
    }
  },
} satisfies Actions

async function getSasUrl(userId: string, containerName: string, fileName: string) {
  const containerClient = getContainerClient(containerName)

  // save file in user email folder
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(userId + '/' + fileName)

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
  if (!AZURE_STORAGE_ACCOUNT_UPLOAD || !AZURE_STORAGE_ACCESS_KEY_UPLOAD) {
    throw Error('Azure Storage credentials not found')
  }
  const baseUrl = `https://${AZURE_STORAGE_ACCOUNT_UPLOAD}.blob.core.windows.net`

  const sharedKeyCredential = new StorageSharedKeyCredential(
    AZURE_STORAGE_ACCOUNT_UPLOAD,
    AZURE_STORAGE_ACCESS_KEY_UPLOAD,
  )
  const blobServiceClient: BlobServiceClient = new BlobServiceClient(baseUrl, sharedKeyCredential)

  return blobServiceClient
}
