import type { BannerMessage } from '../types'
import { bannerMessages } from '$stores'
import { DEFAULT_TIMEOUT_MS, ErrorMessages, StatusTypes } from '../constants'
import { fetchWithTimeout } from './fetchWithTimeout'

/**
 * Returns a json response object from the a fetch of a url
 * @param url The URL to fetch
 * @returns JSON | null
 */
export async function fetchUrl(url: string) {
  try {
    const response = await fetchWithTimeout(url, { timeout: DEFAULT_TIMEOUT_MS })
    return await response.json()
  } catch (error) {
    const bannerErrorMessage: BannerMessage = {
      type: StatusTypes.DANGER,
      title: 'Whoops! Something went wrong.',
      message: ErrorMessages.FETCH_TIMEOUT,
      error: error,
    }
    bannerMessages.update((data) => [...data, bannerErrorMessage])
    return null
  }
}
