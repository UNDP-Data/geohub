import { writable, type Writable } from 'svelte/store';

export const COLORMAP_NAME_CONTEXT_KEY = 'colormap-name-store';

/**
 * Storing colormap name
 */
export type ColorMapNameStore = Writable<string>;

export const createColorMapNameStore = () => {
	return writable(<string>'');
};
