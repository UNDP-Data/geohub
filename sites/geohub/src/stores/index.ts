import { writable } from 'svelte/store'
import type { Map as MaplibreMap } from 'maplibre-gl'
import type { BannerMessage, Layer, SpriteImage } from '$lib/types'

// progress / indicator bar displayed in the drawer for async fetch data
export const indicatorProgress = writable(false)

// layer map list
export const layerList = writable(<Layer[]>[])

// map store for maplibre-gl object
export const map = writable<MaplibreMap>(null)

// content to display in the banner
export const bannerMessages = writable(<BannerMessage[]>[])

// vector : sprite list
export const spriteImageList = writable(<SpriteImage[]>[])

export const filterInputTags = writable([])
