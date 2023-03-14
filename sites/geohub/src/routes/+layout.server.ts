import type { LayoutServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig'

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.getSession()
  let config: UserConfig
  try {
    const response = await event.fetch('/api/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      config = await response.json()
    } else {
      config = DefaultUserConfig
    }
  } catch (err) {
    config = DefaultUserConfig
  }

  return {
    session,
    config,
    azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
    titilerUrl: env.TITILER_ENDPOINT,
  }
}
