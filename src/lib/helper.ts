import * as helper from './helper'
import type {
  FillLayerSpecification,
  HeatmapLayerSpecification,
  LineLayerSpecification,
  RasterLayerSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec/types.g'

import { get } from 'svelte/store'
import Clipper from 'image-clipper'
import mime from 'mime'
import type { BannerMessage, SpriteIcon, SpriteImage } from './types'
import { bannerMessages, map } from '$stores'
import { ClassificationMethodTypes, DEFAULT_TIMEOUT_MS, ErrorMessages, StatusTypes } from './constants'
import { Jenks } from './jenks'
import chroma from 'chroma-js'

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

export const clipSprite = (url: string, id: string, icon: SpriteIcon): Promise<SpriteImage> => {
  return new Promise((resolve) => {
    Clipper(url, function () {
      this.crop(icon.x, icon.y, icon.width, icon.height).toDataURL(function (dataUrl: string) {
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

/**
 * Download a file
 * @param filename
 * @param content
 */
export const downloadFile = (filename: string, content?: string) => {
  const element = document.createElement('a')

  if (content) {
    const type = mime.getType(filename.split('.').pop())
    element.href = `data:${type};charset=utf-8,` + encodeURIComponent(content)
  } else {
    element.href = filename
  }

  element.download = filename
  element.click()
  element.remove()
}

/**
 * Create a 53 bit hash from a string
 * https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 * @param val String to hash
 * @param seed Seed (unsigned integer, 32-bit max)
 * @returns A number
 */
export const hash = (val: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch: number; i < val.length; i++) {
    ch = val.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

/**
 * Remove underscore and extension and apply start/title case to a string
 * @param val String to clean
 */
export const clean = (val: string) => {
  // apply start/title case
  return val
    .replace(/[_-]/g, ' ') // remove underscore and hyphen
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/\b\w/g, (str) => str.toUpperCase())
}
/**
 * Rescale input value based on min/max of old/new scale
 * @param input
 * @param oldMin
 * @param oldMax
 * @param newMin
 * @param newMax
 */
export const remapInputValue = (input = 0, oldMin = 0, oldMax = 0, newMin = 0, newMax = 255) => {
  const percent = (input - oldMin) / (oldMax - oldMin)
  return percent * (newMax - newMin) + newMin
}

export const getSampleFromInterval = (intervalStart: number, intervalEnd: number, numberOfItems: number) => {
  const randomSamplesFromInterval = []

  while (randomSamplesFromInterval.length < numberOfItems) {
    const randomValue = remapInputValue(Math.random(), 0, 1, intervalStart, intervalEnd)
    randomSamplesFromInterval.push(randomValue)
  }
  return randomSamplesFromInterval
}

export const getIntervalList = (
  classificationMethod: ClassificationMethodTypes,
  layerMin: number,
  layerMax: number,
  randomSample: number[],
  numberOfClasses: number,
) => {
  let intervalList: number[]
  if (classificationMethod === ClassificationMethodTypes.NATURAL_BREAK) {
    intervalList = new Jenks([layerMin, ...randomSample, layerMax], numberOfClasses).naturalBreak().map((element) => {
      return Number(element.toFixed(2))
    })
  } else if ((classificationMethod === ClassificationMethodTypes.LOGARITHMIC && layerMin < 1) || layerMax < 1) {
    const range = layerMax - layerMin
    const positive = [layerMin, ...randomSample, layerMax].map((v) => {
      return remapInputValue(v, layerMin, layerMax, 1, 1 + range)
    })
    intervalList = chroma
      .limits(positive, classificationMethod, numberOfClasses)
      .map((v) => {
        return remapInputValue(v, 1, 1 + range, layerMin, layerMax)
      })
      .map((element) => {
        return Number(element.toFixed(2))
      })
  } else {
    intervalList = chroma
      .limits([layerMin, ...randomSample, layerMax], classificationMethod, numberOfClasses)
      .map((element) => {
        return Number(element.toFixed(2))
      })
  }
  return intervalList
}
