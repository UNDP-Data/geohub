import { writable } from 'svelte/store'
import type { Map as MaplibreMap } from 'maplibre-gl'
import type { Layer, SpriteImage } from '$lib/types'

// progress / indicator bar displayed in the drawer for async fetch data
export const indicatorProgress = writable(false)

// layer map list
export const layerList = writable(<Layer[]>[])

// map store for maplibre-gl object
export const map = writable<MaplibreMap>(null)

// vector : sprite list
export const spriteImageList = writable(<SpriteImage[]>[])

export const filterInputTags = writable([])

export const layerState = writable({})
