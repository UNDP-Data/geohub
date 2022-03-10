import { writable } from 'svelte/store'
import { TreeNodeInitialValues } from '../lib/constants'
import type { Layer } from '../lib/types'

// The selectedLayerList will contain a list of all the layer ids
export const dynamicLayers = writable([])
export const wtree = writable({
  tree: TreeNodeInitialValues,
})

export const layerList = writable(<Layer[]>[])
