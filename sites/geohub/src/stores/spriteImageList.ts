import { writable, type Writable } from 'svelte/store';
import type { SpriteImage } from '$lib/types';

export const SPRITEIMAGE_CONTEXT_KEY = 'maplibre-sprite-image-store';

export type SpriteImageStore = Writable<SpriteImage[]>;

export const createSpriteImageStore = () => {
	return writable(<SpriteImage[]>[]);
};
