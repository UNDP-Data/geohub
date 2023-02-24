import type { Actions, PageServerLoad } from './$types'
import { fail } from '@sveltejs/kit'
import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob'
import { env } from '$env/dynamic/private'
import { generateHashKey } from '$lib/server/helpers'

const CONTAINER_NAME = 'userdata'
const FOLDER_NAME = 'raw'

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession()
  if (!session) return
}

export const actions = {
  /**
   * An action to get SAS URL for data uploading
   */
  getSasUrl: async ({ request, locals }) => {
    try {
      const session = await locals.getSession()
      if (!session) return {}
      const user_email = session?.user.email
      const userHash = generateHashKey(user_email)
      const fileName = (await request.formData()).get('fileName') as string
      const now = new Date().toISOString().replace(/(\.\d{3})|[^\d]/g, '')
      const names = fileName.split('.') as [string, string]
      const newFileName = `${names[0]}_${now}.${names[1]}`
      const folder = `${userHash}/${FOLDER_NAME}`
      const sasUrl = await getSasUrl(folder, CONTAINER_NAME, newFileName)
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
  if (!env.AZURE_STORAGE_ACCOUNT_UPLOAD || !env.AZURE_STORAGE_ACCESS_KEY_UPLOAD) {
    throw Error('Azure Storage credentials not found')
  }
  const baseUrl = `https://${env.AZURE_STORAGE_ACCOUNT_UPLOAD}.blob.core.windows.net`

  const sharedKeyCredential = new StorageSharedKeyCredential(
    env.AZURE_STORAGE_ACCOUNT_UPLOAD,
    env.AZURE_STORAGE_ACCESS_KEY_UPLOAD,
  )
  const blobServiceClient: BlobServiceClient = new BlobServiceClient(baseUrl, sharedKeyCredential)

  return blobServiceClient
}
