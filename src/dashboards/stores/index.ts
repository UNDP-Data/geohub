import type { Map } from 'maplibre-gl'
import { writable } from 'svelte/store'

// map store for maplibre-gl object
export const map = writable<Map>(null)

// map store for maplibre-gl object
export const year = writable<number>(null)

// store for circle feature created by editor
export const circleFeatures = writable([])
