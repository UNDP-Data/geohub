import type { Layer, VectorLayerMetadata, VectorLayerTileStatLayer } from '$lib/types'
import type { Map } from 'maplibre-gl'
import { getLayerStyle } from './getLayerStyle'

export const getLayerNumberProperties = (map: Map, layer: Layer) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const vectorInfo: VectorLayerMetadata[] = layer.info.json.vector_layers

  const vectorLayerMeta: VectorLayerMetadata = JSON.parse(
    JSON.stringify(vectorInfo.find((l) => l.id === getLayerStyle(map, layer.id)['source-layer'])),
  )

  const tilestats: {
    layerCount: number
    layers: VectorLayerTileStatLayer[]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  } = layer.info.json.tilestats
  if (tilestats) {
    const vectorLayerStats = tilestats.layers.find((l) => l.layer === getLayerStyle(map, layer.id)['source-layer'])
    vectorLayerStats.attributes.forEach((attr) => {
      if (attr.type.toLowerCase() !== 'number') {
        delete vectorLayerMeta.fields[attr.attribute]
      }
    })
  }
  return vectorLayerMeta
}
