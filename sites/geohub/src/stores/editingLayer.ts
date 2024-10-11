import type { Layer } from '$lib/types';
import { writable } from 'svelte/store';

export const EDITING_LAYER_STORE_CONTEXT_KEY = 'maplibre-editing-layer-store';

export type EditingLayerStore = ReturnType<typeof createEditingLayerStore>;

export function createEditingLayerStore() {
	const { set, update, subscribe } = writable<Layer | undefined>(undefined);

	return {
		subscribe,
		update,
		set
	};
}
