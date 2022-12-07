import { DEFAULT_TIMEOUT_MS } from '../constants'

export async function fetchWithTimeout(resource: string, options = { timeout: DEFAULT_TIMEOUT_MS }) {
  const { timeout = DEFAULT_TIMEOUT_MS } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  })
  clearTimeout(id)
  return response
}
