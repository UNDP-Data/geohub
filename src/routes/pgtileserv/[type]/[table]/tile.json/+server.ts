import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import type { PgtileservDetailJson, PgtileservIndexJson, TileJson } from '$lib/types'
import { PUBLIC_PGTILESERV_API_ENDPOINT } from '$lib/variables/public'

/**
 * /pgtileserv/[type]/[table]/tile.json
 * @param params.type either 'table' or 'function
 * @param params.table schemaname and table name (e.g., zambia.poverty)
 * @returns return TileJSON v3.0.0 (https://github.com/mapbox/tilejson-spec/tree/master/3.0.0)
 */
export const GET: RequestHandler = async ({ params }) => {
  const type = params.type
  const table = params.table

  if (!['table', 'function'].includes(type)) {
    throw error(400, { message: `type should be either table or function` })
  }

  if (type === 'function') {
    throw error(400, { message: `function type is currently not available` })
  }

  const indexJson = await getIndexJson(table)
  const detailUrl: string = indexJson.detailurl
  const tilejson = await getTileJson(detailUrl)

  return new Response(JSON.stringify(tilejson))
}

const getIndexJson = async (table: string) => {
  const url = `${PUBLIC_PGTILESERV_API_ENDPOINT}/index.json`
  const res = await fetch(url)
  const json: PgtileservIndexJson = await res.json()
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }

  if (!(json[table] && json[table].type === 'table')) {
    throw error(404, { message: `${table} does not exist.` })
  }

  return json[table]
}

const getTileJson = async (url: string) => {
  const res = await fetch(url)
  const json: PgtileservDetailJson = await res.json()
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }

  const fields: { [key: string]: string } = {}
  json.properties.forEach((prop) => {
    fields[prop.name] = `${prop.type}. ${prop.description}`
  })

  const tilejson: TileJson = {
    tilejson: '3.0.0',
    name: `${json.id}`,
    description: json.description,
    version: '1.0.0',
    attribution: 'United Nations Development Programme',
    scheme: 'xyz',
    tiles: [json.tileurl],
    minzoom: json.minzoom,
    maxzoom: json.maxzoom,
    bounds: json.bounds,
    center: [...json.center, (json.center[0] + json.center[1]) / 2],
    geometrytype: json.geometrytype,
    vector_layers: [
      {
        id: json.id,
        fields: fields,
        description: json.description,
        minzoom: json.minzoom,
        maxzoom: json.maxzoom,
      },
    ],
  }

  return tilejson
}
