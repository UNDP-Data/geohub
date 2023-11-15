import { writable, type Writable } from 'svelte/store';

export const PAGE_DATA_LOADING_CONTEXT_KEY = 'page-data-loading-store';

export type PageDataLoadingStore = Writable<boolean>;

export const createPageDataLoadingStore = () => {
	return writable(<boolean>true);
};
