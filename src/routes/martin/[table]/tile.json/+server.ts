import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import type { MartinLayerMetadata, TileJson } from '$lib/types'
import { PUBLIC_MARTIN_API_ENDPOINT } from '$lib/variables/public'

/**
 * /martin/[table]/tile.json
 * @param params.table schemaname and table name (e.g., zambia.poverty)
 * @returns return TileJSON v3.0.0 (https://github.com/mapbox/tilejson-spec/tree/master/3.0.0)
 */
export const GET: RequestHandler = async ({ params }) => {
  const table = params.table

  const indexJson = await getIndexJson(table)
  // convert tilejson v2.2.0 to v3.0.0
  const tilejson = await getTileJson(table, indexJson)

  return new Response(JSON.stringify(tilejson))
}

const getIndexJson = async (table: string) => {
  const url = `${PUBLIC_MARTIN_API_ENDPOINT}/index.json`
  const res = await fetch(url)
  const json: { [key: string]: MartinLayerMetadata } = await res.json()
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }

  if (!json[table]) {
    throw error(404, { message: `${table} does not exist.` })
  }

  return json[table]
}

const getTileJson = async (table: string, indexJson: MartinLayerMetadata) => {
  const url = `${PUBLIC_MARTIN_API_ENDPOINT}/${table}.json`
  const res = await fetch(url)
  const tilejson: TileJson = await res.json()
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }

  const fields: { [key: string]: string } = {}
  Object.keys(indexJson.properties).forEach((key) => {
    let dataType = indexJson.properties[key]
    switch (dataType) {
      case 'varchar':
      case 'text':
      case 'char':
      case 'name':
        dataType = 'string'
        break
      case 'float4':
      case 'float8':
      case 'int2':
      case 'int4':
      case 'numeric':
        dataType = 'number'
        break
    }
    fields[key] = `${key} with ${dataType} data type`
  })
  ;(tilejson.tilejson = '3.0.0'), (tilejson.description = `${table} data from PostGIS via martin server`)
  tilejson.attribution = 'United Nations Development Programme'
  tilejson.geometrytype = indexJson.geometry_type

  switch (tilejson.geometrytype.toLocaleLowerCase()) {
    case 'multipoint':
      tilejson.geometrytype = 'point'
      break
    case 'multilinestring':
      tilejson.geometrytype = 'line'
      break
    case 'multipolygon':
      tilejson.geometrytype = 'polygon'
      break
  }

  tilejson.vector_layers = [
    {
      id: table,
      fields: fields,
      description: tilejson.description,
      minzoom: tilejson.minzoom,
      maxzoom: tilejson.maxzoom,
    },
  ]

  return tilejson
}
