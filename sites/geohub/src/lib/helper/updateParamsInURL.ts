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
  const mapStore = get(map)
  if ('getStyle' in mapStore) {
    const style = mapStore.getStyle()

    if (style?.sources) {
      console.log(layerURL.toString())
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      style.sources[layerStyle.source].tiles = [decodeURI(layerURL.toString())]

      // delete all props which have undefined value
      // probably it is a bug of maplibre to add undefined property (like url, bounds) to the style,
      // and maplibre complains it has error which some of properties are not defined.
      Object.keys(style.sources).forEach((key) => {
        const src = style.sources[key]
        Object.keys(src).forEach((prop) => {
          if (!src[prop]) {
            delete src[prop]
          }
        })
      })
      mapStore.setStyle(style)
    }
  }
}
