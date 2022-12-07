import { error } from '@sveltejs/kit'
import type { PgtileservDetailJson, PgtileservIndexJson, TileJson } from '$lib/types'

export const getPgtileservTileJson = async (table: string, type: string, pgtileservUrl: string) => {
  if (!['table', 'function'].includes(type)) {
    throw error(400, { message: `type should be either table or function` })
  }

  const indexJson = await getIndexJson(table, pgtileservUrl)
  const detailUrl: string = indexJson.detailurl
  const tilejson = await getTileJson(detailUrl)
  return tilejson
}

const getIndexJson = async (table: string, pgtileservUrl: string) => {
  const url = `${pgtileservUrl}/index.json`
  const res = await fetch(url)
  const json: PgtileservIndexJson = await res.json()
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
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
  json.properties?.forEach((prop) => {
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
    center: [0, 0, 0],
    bounds: [-180, -90, 180, 90],
    minzoom: json.minzoom,
    maxzoom: json.maxzoom,
    vector_layers: [],
  }
  if (json.bounds) {
    tilejson.bounds = json.bounds
  }
  if (json.center) {
    tilejson.center = [...json.center, (json.center[0] + json.center[1]) / 2]
  }
  if (json.geometrytype) {
    tilejson.geometrytype = json.geometrytype
  }
  if (Object.keys(fields).length > 0) {
    tilejson.vector_layers = [
      {
        id: json.id,
        fields: fields,
        description: json.description,
        minzoom: json.minzoom,
        maxzoom: json.maxzoom,
      },
    ]
  }

  return tilejson
}
