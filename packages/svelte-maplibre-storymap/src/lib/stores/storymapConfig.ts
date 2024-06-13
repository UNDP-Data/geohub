import type { StoryMapConfig } from '$lib/interfaces/StoryMapConfig.js';
import { writable } from 'svelte/store';

export const STORYMAP_CONFIG_STORE_CONTEXT_KEY = 'maplibre-storymap-config-store';

export type StoryMapConfigStore = ReturnType<typeof createStoryMapConfigStore>;

export const createStoryMapConfigStore = () => {
	const { set, update, subscribe } = writable<StoryMapConfig>(undefined);

	return {
		subscribe,
		update,
		set
	};
};
