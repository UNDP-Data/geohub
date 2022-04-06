import { writable } from 'svelte/store'
import { TreeNodeInitialValues } from '../lib/constants'
import type { BannerContent, Layer } from '../lib/types'

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

// content to display in the banner
export const bannerMessages = writable(<BannerContent[]>[])
