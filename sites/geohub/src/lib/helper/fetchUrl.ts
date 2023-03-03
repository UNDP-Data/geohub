import { DEFAULT_TIMEOUT_MS } from '../constants'
import { fetchWithTimeout } from './fetchWithTimeout'

/**
 * Returns a json response object from the a fetch of a url
 * @param url The URL to fetch
 * @returns JSON | null
 */
export async function fetchUrl(url: string) {
  return new Promise<Response>((resolve, reject) => {
    fetchWithTimeout(url, { timeout: DEFAULT_TIMEOUT_MS })
      .then((res) => res.json())
      .then((json) => {
        resolve(json)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
