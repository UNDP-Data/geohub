import { writable } from 'svelte/store'
import type { Map as MaplibreMap } from 'maplibre-gl'
import type { BannerMessage, Bucket, Layer, SpriteImage, TreeNode } from '$lib/types'

// dynamic layer list
export const dynamicLayers = writable([])

// progress / indicator bar displayed in the drawer for async fetch data
export const indicatorProgress = writable(false)

// modal is displayed
export const modalVisible = writable(false)

// layer map list
export const layerList = writable(<Layer[]>[])

// map store for maplibre-gl object
export const map = writable<MaplibreMap>(null)

// tree store for buckets
export const treeBucket = writable(<TreeNode[]>[])

// list of buckets / containers
export const bucketList = writable(<Bucket[]>[])

// content to display in the banner
export const bannerMessages = writable(<BannerMessage[]>[])

// vector : sprite list
export const spriteImageList = writable(<SpriteImage[]>[])

// store metadata
export const layerMetadata = writable(new Map())

// layer labelled
export const layerLabelled = writable(new Map())

export const tags = writable([])
