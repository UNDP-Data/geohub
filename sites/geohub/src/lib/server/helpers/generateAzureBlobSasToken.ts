import { AccountSASPermissions, BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import { env } from '$env/dynamic/private'
import { TOKEN_EXPIRY_PERIOD_MSEC } from '$lib/constants'

export const generateAzureBlobSasToken = (url: string) => {
  const account =
    url.indexOf(env.AZURE_STORAGE_ACCOUNT) !== -1 ? env.AZURE_STORAGE_ACCOUNT : env.AZURE_STORAGE_ACCOUNT_UPLOAD
  const accessKey =
    url.indexOf(env.AZURE_STORAGE_ACCOUNT) !== -1 ? env.AZURE_STORAGE_ACCESS_KEY : env.AZURE_STORAGE_ACCESS_KEY_UPLOAD

  const sharedKeyCredential = new StorageSharedKeyCredential(account, accessKey)
  // create storage container
  const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential)

  // generate account SAS token for vector tiles. This is needed because the
  // blob level SAS tokens have the blob name encoded inside the SAS token and the
  // adding a vector tile to mapbox requires adding a template/pattern not one file and reading many more files as well.

  const ACCOUNT_SAS_TOKEN_URI = blobServiceClient.generateAccountSasUrl(
    new Date(new Date().valueOf() + TOKEN_EXPIRY_PERIOD_MSEC),
    AccountSASPermissions.parse('r'),
    'o',
  )
  const ACCOUNT_SAS_TOKEN_URL = new URL(ACCOUNT_SAS_TOKEN_URI)
  return ACCOUNT_SAS_TOKEN_URL.search
}
