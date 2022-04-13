import * as helper from './helper'
import type {
  RasterLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec/types'
import type { BannerMessage, spriteIcon, spriteImage } from './types'
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
 * @param style JSON object
 * @returns string Formatted JSON string
 */
export const stringifyStyleJSON = (style: JSON): string => {
  return JSON.stringify(style, null, 4)
}

export const loadImageToDataUrl = async (url: string): Promise<string> => {
  const blob = await fetch(url).then((r) => r.blob())
  const dataUrl: string = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      }
    }
    reader.readAsDataURL(blob)
  })
  return dataUrl
}

export const clipSprite = (url: string, id: string, icon: spriteIcon): Promise<spriteImage> => {
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
 * @param url The URL to fetch
 * @returns JSON | null
 */
export async function fetchUrl(url: string) {
  try {
    const response = await helper.fetchWithTimeout(url, { timeout: DEFAULT_TIMEOUT_MS })
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

export async function fetchWithTimeout(resource: string, options = { timeout: DEFAULT_TIMEOUT_MS }) {
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
