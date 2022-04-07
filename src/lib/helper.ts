import type {
  RasterLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec/types'
import type { spriteIcon } from './types'
import { get } from 'svelte/store'
import { map } from '../stores/index'
import Clipper from 'image-clipper'

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

export const stringifyStyleJSON = (style: JSON) => {
  return JSON.stringify(style, null, 4)
}

export const loadImageToDataUrl = async (url: string) => {
  const blob = await fetch(url).then((r) => r.blob())
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
  return dataUrl
}

export const loadJson = async (url: string) => {
  return fetch(url).then((data) => data.json())
}

export const clipSprite = (url: string, id: string, icon: spriteIcon) => {
  return new Promise((resolve) => {
    Clipper(url, function () {
      this.crop(icon.x, icon.y, icon.width, icon.height).toDataURL(function (dataUrl) {
        resolve({
          src: dataUrl,
          alt: id,
        })
      })
    })
  })
}
