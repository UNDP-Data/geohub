import type {
  FillLayerSpecification,
  HeatmapLayerSpecification,
  LineLayerSpecification,
  RasterLayerSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl'

import { get } from 'svelte/store'
import { map as mapStore } from '$stores'
import { loadMap } from './loadMap'
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
    map.getSource(layerStyle.source).tiles = [decodeURI(layerURL.toString())]
    map.style.sourceCaches[layerStyle.source].clearTiles()
    map.style.sourceCaches[layerStyle.source].update(map.transform)
    map.triggerRepaint()
  }
}

export const updateLayerURL = async (layerID: string, layerURL: URL, params: Record<string, string>) => {
  const map = get(mapStore)
  //console.log(JSON.stringify(Object.fromEntries(layerURL.searchParams), null, '\t'))
  Object.keys(params).forEach((key) => {
    layerURL.searchParams.set(key, params[key])
  })
  //console.log(JSON.stringify(Object.fromEntries(layerURL.searchParams), null, '\t'))

  if ('getStyle' in map) {
    const style = map.getStyle()

    if (style?.sources) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      style.sources[layerID].tiles = [decodeURI(layerURL.toString())]
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

      map.setStyle(style)
      await loadMap(map)
      mapStore.set(map)
    }
  }
}
