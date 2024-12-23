import type { StoryMapChapter } from '$lib/types';
import { writable } from 'svelte/store';

export const ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY = 'active-storymap-chapter-store';
export type ActiveStorymapChapterStore = ReturnType<typeof createActiveStorymapChapterStore>;

export function createActiveStorymapChapterStore() {
	const { set, update, subscribe } = writable<StoryMapChapter | undefined>(undefined);

	return {
		subscribe,
		update,
		set
	};
}
