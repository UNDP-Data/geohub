import type { RequestHandler } from './$types'
import { generateMetadataJson, getMartinTileJson, getPgtileservTileJson } from '$lib/helper'
import type { TileJson, VectorTileMetadata } from '$lib/types'
import { error } from '@sveltejs/kit'

/**
 * /api/vector/[source]/[table]/metadata.json
 * @param params.source source name either pgtileserv or martin
 * @param params.table schemaname and table name (e.g., zambia.poverty)
 * @returns return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)
 */
export const GET: RequestHandler = async ({ url, params }) => {
  const source = params.source
  const table = url.searchParams.get('table')
  const type = url.searchParams.get('type')

  let tilejson: TileJson
  let metadatajson: VectorTileMetadata
  switch (source) {
    case 'martin':
      tilejson = await getMartinTileJson(table)
      metadatajson = await generateMetadataJson(tilejson, url.origin)
      break
    case 'pgtileserv':
      tilejson = await getPgtileservTileJson(table, type)
      metadatajson = await generateMetadataJson(tilejson, url.origin)
      break
    default:
      throw error(400, { message: `Invalid source parameter.` })
  }

  return new Response(JSON.stringify(metadatajson))
}
