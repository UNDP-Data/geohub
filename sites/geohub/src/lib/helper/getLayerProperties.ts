import type { Layer, VectorLayerMetadata, VectorLayerTileStatLayer } from '$lib/types'
import type { Map } from 'maplibre-gl'
import { getLayerStyle } from './getLayerStyle'

export const getLayerProperties = (map: Map, layer: Layer, onlyNumber = true) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const vectorInfo: VectorLayerMetadata[] = layer.info.json.vector_layers

  let layerId = layer.id
  if (layer.parentId) {
    layerId = layer.parentId
  }

  const vectorLayerMeta: VectorLayerMetadata = JSON.parse(
    JSON.stringify(vectorInfo.find((l) => l.id === getLayerStyle(map, layerId)['source-layer'])),
  )

  if (onlyNumber === true) {
    const tilestats: {
      layerCount: number
      layers: VectorLayerTileStatLayer[]
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } = layer.info.json.tilestats
    if (tilestats) {
      const vectorLayerStats = tilestats.layers.find((l) => l.layer === getLayerStyle(map, layerId)['source-layer'])
      vectorLayerStats.attributes.forEach((attr) => {
        if (attr.type.toLowerCase() !== 'number') {
          delete vectorLayerMeta.fields[attr.attribute]
        }
      })
    }
  }
  return vectorLayerMeta
}
