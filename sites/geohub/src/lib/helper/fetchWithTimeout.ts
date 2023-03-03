import { DEFAULT_TIMEOUT_MS } from '../constants'

export async function fetchWithTimeout(resource: string, options = { timeout: DEFAULT_TIMEOUT_MS }) {
  return new Promise<Response>((resolve, reject) => {
    const { timeout = DEFAULT_TIMEOUT_MS } = options
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    fetch(resource, {
      ...options,
      signal: controller.signal,
    })
      .then((response) => {
        clearTimeout(id)
        resolve(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
