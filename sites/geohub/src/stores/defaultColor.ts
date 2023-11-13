import { writable, type Writable } from 'svelte/store';

export const DEFAULTCOLOR_CONTEXT_KEY = 'maplibre-default-color-store';

export type DefaultColorStore = Writable<string>;

export const createDefaultColorStore = () => {
	return writable(<string>'');
};
