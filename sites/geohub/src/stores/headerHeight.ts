import { writable, type Writable } from 'svelte/store';

export const HEADER_HEIGHT_CONTEXT_KEY = 'header-height-store';

export type HeaderHeightStore = Writable<number>;

export const createHeaderHeightStore = () => {
	return writable(<number>0);
};
