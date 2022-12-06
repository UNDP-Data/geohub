import { error } from '@sveltejs/kit'
import type { TileJson, VectorLayerTileStatLayer, VectorTileMetadata } from '$lib/types'

/**
 * generate metadata.json from tilejson
 * @param tilejson TileJSON object
 * @param origin URL origin
 * @returns return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md
 */
export const generateMetadataJson = async (tilejson: TileJson, origin: string) => {
  const pbfPath = tilejson.tiles[0].replace('{z}/{x}/{y}', '0/0/0')
  const vectorinfoUrl = `${origin}/api/vector/statistics?path=${pbfPath}&layer_name=${tilejson.name}`
  const res = await fetch(vectorinfoUrl)
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }
  const tilestatsLayer: VectorLayerTileStatLayer = await res.json()

  const data: VectorTileMetadata = {
    name: tilejson.name,
    version: '1.3.0',
    type: 'overlay',
    description: tilejson.description,
    attribution: tilejson.attribution,
    format: 'pbf',
    center: '0,0,0',
    bounds: '-180,-90,180,90',
    minzoom: tilejson.minzoom,
    maxzoom: tilejson.maxzoom,
    json: {
      vector_layers: tilejson.vector_layers,
      tilestats: {
        layerCount: 1,
        layers: [tilestatsLayer],
      },
    },
  }

  if (data.json.vector_layers.length === 0) {
    data.json.tilestats?.layers.forEach((layer) => {
      const id = layer.layer
      const fields: { [key: string]: string } = {}
      layer.attributes.forEach((attr) => {
        fields[attr.attribute] = attr.attribute
      })
      data.json.vector_layers.push({ id: id, fields: fields })
    })
  }

  if (tilejson.bounds) {
    data.center = `${(tilejson.bounds[0] + tilejson.bounds[2]) / 2},${(tilejson.bounds[1] + tilejson.bounds[3]) / 2},${
      tilejson.minzoom
    }`
    data.bounds = `${tilejson.bounds[0]},${tilejson.bounds[1]},${tilejson.bounds[2]},${tilejson.bounds[3]}`
  }
  return data
}
