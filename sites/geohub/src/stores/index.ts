import { writable } from 'svelte/store'
import type { Map as MaplibreMap } from 'maplibre-gl'
import type { BannerMessage, Layer, SpriteImage } from '$lib/types'
import { loadMap } from '$lib/helper'
// progress / indicator bar displayed in the drawer for async fetch data
export const indicatorProgress = writable(false)

// layer map list
export const layerList = writable(<Layer[]>[])

// map store for maplibre-gl object
//export const map = writable<MaplibreMap>(null)

// content to display in the banner
export const bannerMessages = writable(<BannerMessage[]>[])

// vector : sprite list
export const spriteImageList = writable(<SpriteImage[]>[])

export const filterInputTags = writable([])

export const layerState = writable({})
function syncMap() {
  const { subscribe, update, set } = writable<MaplibreMap>(null)

  return {
    subscribe: subscribe,
    set: async (m: MaplibreMap) => {
      await loadMap(m)
      console.log('map is loaded')
      set(m)
    },
    update: (fn) =>
      update((oldmap): MaplibreMap => {
        const v = fn()
        set(v)
        console.log(oldmap, v)
        return v
      }),
  }
}
export const map = syncMap()
