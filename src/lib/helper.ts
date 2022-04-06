import type {
  RasterLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec/types'
import { get } from 'svelte/store'
import { bannerMessages, map } from '../stores'
import type { BannerContent } from './types'
import { ErrorMessages, StatusTypes } from './constants'

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

export async function fetchUrl(url: string) {
  try {
    const response = await fetchWithTimeout(url, { timeout: 100 })
    return await response.json()
  } catch (error) {
    const bannerErrorMessage: BannerContent = {
      type: StatusTypes.DANGER,
      title: 'Error',
      message: ErrorMessages.FETCH_TIMEOUT,
    }
    bannerMessages.update((data) => [...data, bannerErrorMessage])
    return null
  }
}

async function fetchWithTimeout(resource: string, options = { timeout: 5000 }) {
  const { timeout = 5000 } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  })
  clearTimeout(id)
  return response
}
