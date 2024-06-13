import { writable } from 'svelte/store';
import type { Map as MaplibreMap } from 'maplibre-gl';

export const STORYMAP_MAPSTORE_CONTEXT_KEY = 'maplibre-storymap-map-store';

export type MapStore = ReturnType<typeof createMapStore>;

export const createMapStore = () => {
	const { set, update, subscribe } = writable<MaplibreMap>(undefined);

	return {
		subscribe,
		update,
		set
	};
};
