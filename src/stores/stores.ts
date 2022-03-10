import { writable } from 'svelte/store'
import { TreeNodeInitialValues } from '../lib/constants'

export const wtree = writable({
  tree: TreeNodeInitialValues
})

export const layerList = writable([])
