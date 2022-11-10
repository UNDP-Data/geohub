import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import type { VectorLayerTileStatAttribute, VectorLayerTileStatLayer, VectorTileMetadata } from '$lib/types'

/**
 * /azstorage/metadata.json
 * @param pbfpath pbf path
 * @returns return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)
 */
export const GET: RequestHandler = async ({ url }) => {
  let pbfpath = url.searchParams.get('pbfpath')
  if (!pbfpath) {
    throw error(400, { message: `'pbfpath' is required.` })
  }
  pbfpath = decodeURI(pbfpath)
  const metaURI = pbfpath.replace('{z}/{x}/{y}.pbf', 'metadata.json')

  const res = await fetch(metaURI)
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }
  const data: VectorTileMetadata = await res.json()
  if (data.json) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    data.json = JSON.parse(data.json)
  }

  if (!data.description) {
    data.description = `Vector tile of ${data.name} from UNDP's Azure blob container`
  }

  if (!data.attribution) {
    data.attribution = 'United Nations Development Programme'
  }

  const layers = await getStats(url.origin, pbfpath, data.json.tilestats.layers)
  if (layers.length > 0) {
    data.json.tilestats.layerCount = layers.length
  } else {
    data.json.tilestats = {
      layerCount: data.json.vector_layers.length,
      layers: data.json.tilestats.layers,
    }
  }

  return new Response(JSON.stringify(data))
}

const getStats = async (origin: string, url: string, tileStatsLayers: VectorLayerTileStatLayer[]) => {
  const pbfPath = url.replace('{z}/{x}/{y}', '0/0/0')

  const layers: VectorLayerTileStatLayer[] = []

  for (let i = 0; i < tileStatsLayers.length; i++) {
    const tilestatsLayer = tileStatsLayers[i]
    const vectorinfoUrl = `${origin}/vectorinfo/static?path=${pbfPath}&layer_name=${tilestatsLayer.layer}`
    const res = await fetch(vectorinfoUrl)
    if (!res.ok) {
      console.error(res.status, res.statusText)
      break
    }
    const stats: VectorLayerTileStatAttribute[] = await res.json()

    if (stats) {
      tilestatsLayer.attributeCount = stats.length
      tilestatsLayer.attributes = stats
    }
    layers.push(tilestatsLayer)
  }

  return layers
}
