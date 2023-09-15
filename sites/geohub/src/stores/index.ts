import { writable } from 'svelte/store';
import type { SpriteImage } from '$lib/types';

export * from './layerList';
export * from './map';
export * from './websocket';

// vector : sprite list
export const spriteImageList = writable(<SpriteImage[]>[]);

export const filterInputTags = writable([]);
