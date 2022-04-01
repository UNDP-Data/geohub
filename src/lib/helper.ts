import type {
  RasterLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec/types'
import { get } from 'svelte/store'
import { map } from '../stores/index'

export const updateParamsInURL = (
  definition: RasterLayerSpecification | LineLayerSpecification | FillLayerSpecification | SymbolLayerSpecification,
  layerURL: URL,
  params: Record<string, string>,
) => {
  Object.keys(params).forEach((key) => {
    layerURL.searchParams.set(key, params[key])
  })

  const mapStore = get(map)
  mapStore.getSource(definition.source).tiles = [decodeURI(layerURL.toString())]
  mapStore.style.sourceCaches[definition.source].clearTiles()
  mapStore.style.sourceCaches[definition.source].update(mapStore.transform)
  mapStore.triggerRepaint()
}
