import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import type { TileJson } from '$lib/types'
import { generateMetadataJson } from '$lib/helper'

/**
 * /pgtileserv/[table]/metadata.json
 * @param params.table schemaname and table name (e.g., zambia.poverty)
 * @returns return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)
 */
export const GET: RequestHandler = async ({ url }) => {
  const tilejson = await getTileJson(url)
  const metadatajson = await generateMetadataJson(tilejson, url.origin)

  return new Response(JSON.stringify(metadatajson))
}

const getTileJson = async (url: URL) => {
  const tileJsonUrl = url.href.replace('metadata.json', 'tile.json')
  const res = await fetch(tileJsonUrl)
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }
  const json: TileJson = await res.json()
  return json
}
