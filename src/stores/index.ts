import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { TreeNodeInitialValues } from '$lib/constants'
import type { BannerMessage, Bucket, Layer, SpriteImage, TreeNode } from '$lib/types'
import { DynamicLayerLegendTypes } from '$lib/constants'
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

// tree store for buckets
export const treeBucket = writable(<TreeNode[]>[])

// list of buckets / containers
export const bucketList = writable(<Bucket[]>[])

// content to display in the banner
export const bannerMessages = writable(<BannerMessage[]>[])

// vector : sprite list
export const spriteImageList = writable(<SpriteImage[]>[])

export const selectedLegendType = writable(DynamicLayerLegendTypes.CONTINUOUS.toString())
export const cmap = writable([])
export const activeColorMapName: Writable<string> = writable('viridis')
export const rangeSliderValues: Writable<number[]> = writable([])
export const selectedClassificationMethod: Writable<string> = writable('e')
export const numberOfClasses = writable(5)
