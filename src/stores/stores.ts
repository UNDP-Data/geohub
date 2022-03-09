import { writable } from 'svelte/store'

export const wtree = writable({
  tree: {
    label: 'GeoHub Azure Storage',
    children: [],
    path: '/',
    url: null,
    isRaster: false,
  },
})
export const layerList = writable([])
