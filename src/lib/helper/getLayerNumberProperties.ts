import type { Layer, VectorLayerMetadata, VectorLayerTileStatLayer } from '$lib/types'

export const getLayerNumberProperties = (layer: Layer) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const vectorInfo: VectorLayerMetadata[] = layer.info.json.vector_layers

  const vectorLayerMeta: VectorLayerMetadata = JSON.parse(
    JSON.stringify(vectorInfo.find((l) => l.id === layer.definition['source-layer'])),
  )

  const tilestats: {
    layerCount: number
    layers: VectorLayerTileStatLayer[]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  } = layer.info.json.tilestats
  if (tilestats) {
    const vectorLayerStats = tilestats.layers.find((l) => l.layer === layer.definition['source-layer'])
    vectorLayerStats.attributes.forEach((attr) => {
      if (attr.type.toLowerCase() !== 'number') {
        delete vectorLayerMeta.fields[attr.attribute]
      }
    })
  } else {
    Object.keys(vectorLayerMeta.fields).forEach((key) => {
      if (vectorLayerMeta.fields[key] !== 'Number') {
        delete vectorLayerMeta.fields[key]
      }
    })
  }
  return vectorLayerMeta
}
