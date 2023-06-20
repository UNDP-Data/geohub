import type { Map } from 'maplibre-gl'
import { writable } from 'svelte/store'

// map store for maplibre-gl object
export const map = writable<Map>(undefined)

export const admin = writable({})

// map store for maplibre-gl object
export const year = writable<number>(undefined)
