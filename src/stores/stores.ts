import { writable } from 'svelte/store';

export const wtree = writable({});
export const layerList = writable([]);

// The selectedLayerList will contain a list of all the layer ids
export const dynamicLayers = writable({});