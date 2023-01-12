import { error } from '@sveltejs/kit'
import type { VectorLayerTileStatLayer, VectorTileMetadata } from '$lib/types'
import * as pmtiles from 'pmtiles'

/**
 * get metadata json of static pbf
 * @param url pbf path
 * @returns return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)
 */
export const getStaticPbfMetadataJson = async (origin: string, url: string) => {
  if (url.startsWith('pmtiles://')) {
    const p = new pmtiles.PMTiles(`${url.replace('pmtiles://', '')}`)
    const metadata = await p.getMetadata()
    const header = await p.getHeader()

    const bounds: number[] = [header.minLon, header.minLat, header.maxLon, header.maxLat]

    const data: VectorTileMetadata = {
      name: metadata.name,
      format: metadata.format,
      center: [header.centerLon, header.centerLat, header.centerZoom].join(','),
      bounds: bounds.join(','),
      minzoom: header.minZoom,
      maxzoom: header.maxZoom,
      attribution: metadata.attribution,
      description: metadata.description,
      type: metadata.type,
      version: metadata.version,
      json: {
        vector_layers: metadata.vector_layers,
        tilestats: metadata.tilestats,
      },
    }
    return data
  } else {
    //static pbf

    const pbfpath = decodeURI(url)
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

    const layers = await getStats(origin, pbfpath, data.json.tilestats.layers)
    if (layers.length > 0) {
      data.json.tilestats.layerCount = layers.length
    } else {
      data.json.tilestats = {
        layerCount: data.json.vector_layers.length,
        layers: data.json.tilestats.layers,
      }
    }

    return data
  }
}

const getStats = async (origin: string, url: string, tileStatsLayers: VectorLayerTileStatLayer[]) => {
  const pbfPath = url.replace('{z}/{x}/{y}', '0/0/0')

  const layers: VectorLayerTileStatLayer[] = []

  for (let i = 0; i < tileStatsLayers.length; i++) {
    let tilestatsLayer = tileStatsLayers[i]
    const vectorinfoUrl = `${origin}/api/vector/statistics?path=${pbfPath}&layer_name=${tilestatsLayer.layer}`
    const res = await fetch(vectorinfoUrl)
    if (res.ok) {
      tilestatsLayer = await res.json()
    }
    layers.push(tilestatsLayer)
  }

  return layers
}
