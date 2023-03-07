import type { LayoutServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig'

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.getSession()

  const config: UserConfig = DefaultUserConfig

  return {
    session,
    config,
    azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  }
}
