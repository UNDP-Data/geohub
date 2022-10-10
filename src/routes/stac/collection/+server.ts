import type { StacCollection } from '$lib/interfaces'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
  const baseUrl = url.searchParams.get('url')

  const requestUrl = `${baseUrl}/collections`
  const res = await fetch(requestUrl)
  const collection = await res.json()
  const stacCollection: StacCollection[] = collection.collections
  return new Response(JSON.stringify(stacCollection))
}
