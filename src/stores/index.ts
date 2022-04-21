import { writable } from 'svelte/store'
import { TreeNodeInitialValues } from '$lib/constants'
import type { BannerMessage, Bucket, Layer, SpriteImage } from '$lib/types'

// dynamic layer list
export const dynamicLayers = writable([])

// progress / indicator bar displayed in the drawer for async fetch data
export const indicatorProgress = writable(false)

// layer map list
export const layerList = writable(<Layer[]>[])

// map store for maplibre-gl object
export const map = writable(null)

// tree store in load data tab drawer
export const wtree = writable({ tree: TreeNodeInitialValues })

export const treeBucket = writable({ tree: TreeNodeInitialValues })

export const bucketList = writable(<Bucket[]>[])

// content to display in the banner
export const bannerMessages = writable(<BannerMessage[]>[])

// vector : sprite list
export const spriteImageList = writable(<SpriteImage[]>[])

export const bucketFeature = writable(false)
