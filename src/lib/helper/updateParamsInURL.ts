import type {
  FillLayerSpecification,
  HeatmapLayerSpecification,
  LineLayerSpecification,
  RasterLayerSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl'

import { get } from 'svelte/store'
import { map } from '$stores'

export const updateParamsInURL = (
  definition:
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
  const mapStore = get(map)
  if ('getStyle' in mapStore) {
    const style = mapStore.getStyle()

    if (style?.sources) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      style.sources[definition.source].tiles = [decodeURI(layerURL.toString())]
      mapStore.setStyle(style)
    }
  }
}
