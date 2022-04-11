import type {
  RasterLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec/types'
import type { BannerMessage, spriteIcon } from './types'
import { get } from 'svelte/store'
import Clipper from 'image-clipper'
import { bannerMessages, map } from '../stores'
import { DEFAULT_TIMEOUT_MS, ErrorMessages, StatusTypes } from './constants'

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

/**
 * Returns a formatted stringified version of json object
 * @param {JSON} style
 * @returns {string}
 */
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

/**
 * Returns a json response object from the a fetch of a url
 * @param {string} url
 * @returns {JSON}
 */
export async function fetchUrl(url: string) {
  try {
    const response = await fetchWithTimeout(url, { timeout: DEFAULT_TIMEOUT_MS })
    return await response.json()
  } catch (error) {
    const bannerErrorMessage: BannerMessage = {
      type: StatusTypes.DANGER,
      title: 'Whoops! Something went wrong.',
      message: ErrorMessages.FETCH_TIMEOUT,
    }
    bannerMessages.update((data) => [...data, bannerErrorMessage])
    return null
  }
}

async function fetchWithTimeout(resource: string, options = { timeout: DEFAULT_TIMEOUT_MS }) {
  const { timeout = DEFAULT_TIMEOUT_MS } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  })
  clearTimeout(id)
  return response
}
