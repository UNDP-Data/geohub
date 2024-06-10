import { writable } from 'svelte/store';
import type { StyleSpecification } from 'maplibre-gl';

export const STORYMAP_MAPSTYLE_STORE_CONTEXT_KEY = 'maplibre-storymap-mapstyle-store';

export type MapStyleStore = ReturnType<typeof createMapStyleStore>;

export const createMapStyleStore = () => {
	const { set, update, subscribe } = writable<StyleSpecification | string>(undefined);

	return {
		subscribe,
		update,
		set
	};
};
