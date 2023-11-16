import { writable, type Writable } from 'svelte/store';

export const PROGRESS_BAR_CONTEXT_KEY = 'progress-bar-store';

export type ProgressBarStore = Writable<boolean>;

export const createProgressBarStore = () => {
	return writable(false);
};
