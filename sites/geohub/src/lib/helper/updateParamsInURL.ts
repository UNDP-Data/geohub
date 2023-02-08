import type {
  FillLayerSpecification,
  HeatmapLayerSpecification,
  LineLayerSpecification,
  RasterLayerSpecification,
  RasterSourceSpecification,
  StyleSpecification,
  SymbolLayerSpecification,
  VectorSourceSpecification,
} from 'maplibre-gl'

import { get } from 'svelte/store'
import { map as mapStore } from '$stores'
import { loadMap } from './loadMap'
import { getLayerStyle } from '$lib/helper/getLayerStyle'
export const updateParamsInURL = (
  layerStyle:
    | RasterLayerSpecification
    | LineLayerSpecification
    | FillLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification,
  layerURL: URL,
  params: Record<string, string>,
) => {
  Object.keys(params).forEach((key) => {
    layerURL.searchParams.set(key, params[key])
  })
  const map = get(mapStore)
  if (map.getSource(layerStyle.source)) {
    const source = map.getSource(layerStyle.source) as RasterSourceSpecification | VectorSourceSpecification
    source.tiles = [decodeURI(layerURL.toString())]
    map.style.sourceCaches[layerStyle.source].clearTiles()
    map.style.sourceCaches[layerStyle.source].update(map.transform)
    map.triggerRepaint()
    map.fire('source:changed', {
      layerId: layerStyle.id,
    })
  }
}

export const updateLayerURL = async (
  layerStyle:
    | RasterLayerSpecification
    | LineLayerSpecification
    | FillLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification,
  layerURL: URL,
  params: Record<string, string>,
) => {
  const map = get(mapStore)
  updateParamsInURL(layerStyle, layerURL, params)
  await loadMap(map)
  mapStore.set(map)
}
