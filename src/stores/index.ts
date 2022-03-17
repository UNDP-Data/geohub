import { writable } from 'svelte/store'
import { TreeNodeInitialValues } from '../lib/constants'
import type { Layer } from '../lib/types'

// dynamic layer list
export const dynamicLayers = writable([])

// progress / indicator bar displayed in the drawer for async fetch data
export const indicatorProgress = writable(false)

// layer map list
export const layerList = writable(<Layer[]>[])

// map store for maplibre-gl object
export const map = writable(null)

// upon removal of layer in the layers tab, set to true for reactivity in tree node component
export const removedLayerFromLayersTab = writable(false)

// tree store in load data tab drawer
export const wtree = writable({ tree: TreeNodeInitialValues })
