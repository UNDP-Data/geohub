import { writable, type Writable } from 'svelte/store';

export const EDITING_MENU_SHOWN_CONTEXT_KEY = 'editing-menu-shown-store';

export type EditingMenuShownStore = Writable<boolean>;

export const createEditingMenuShownStore = () => {
	return writable(<boolean>false);
};
