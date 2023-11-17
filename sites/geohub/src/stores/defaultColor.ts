import { writable, type Writable } from 'svelte/store';

export const DEFAULTCOLOR_CONTEXT_KEY = 'maplibre-default-color-store';
export const DEFAULTCOLOR_CONTEXT_KEY_LABEL = 'maplibre-default-color-store-label';

export type DefaultColorStore = Writable<string>;

export const createDefaultColorStore = () => {
	return writable(<string>'');
};
