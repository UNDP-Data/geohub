import type { LayoutServerLoad } from './$types'
import { env } from '$env/dynamic/private'

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.getSession()
  return {
    session,
    azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  }
}
