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
  const vectorinfoUrl = `${origin}/vectorinfo/static?path=${pbfPath}&layer_name=${tilejson.name}`
  const res = await fetch(vectorinfoUrl)
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }
  const stats = await res.json()

  const tilestatsLayer: VectorLayerTileStatLayer = {
    layer: tilejson.name,
    geometry: tilejson.geometrytype,
    count: null,
    attributeCount: null,
    attributes: null,
  }

  if (stats) {
    tilestatsLayer.attributeCount = stats.length
    tilestatsLayer.attributes = stats
  }

  const data: VectorTileMetadata = {
    name: tilejson.name,
    version: '1.3.0',
    type: 'overlay',
    description: tilejson.description,
    attribution: tilejson.attribution,
    format: 'pbf',
    center: `${(tilejson.bounds[0] + tilejson.bounds[2]) / 2},${(tilejson.bounds[1] + tilejson.bounds[3]) / 2},${
      tilejson.minzoom
    }`,
    bounds: `${tilejson.bounds[0]},${tilejson.bounds[1]},${tilejson.bounds[2]},${tilejson.bounds[3]}`,
    minzoom: tilejson.minzoom,
    maxzoom: tilejson.maxzoom,
    json: {
      vector_layers: tilejson.vector_layers,
      tilestats: {
        layerCount: 1,
        layers: [tilestatsLayer],
      },
    },
    stats: stats, // TODO: this stats property sould be deleted
  }
  return data
}
