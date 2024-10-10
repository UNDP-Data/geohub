import { writable, type Writable } from 'svelte/store';

export const SIDEBAR_WIDTH_CONTEXT_KEY = 'sidebar-width-store';

export type SidebarWidthStore = Writable<number>;

export const createSidebarWidthStore = () => {
	return writable(<number>0);
};
