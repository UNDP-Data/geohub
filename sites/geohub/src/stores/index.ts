import { writable } from 'svelte/store';
import type { Layer, SpriteImage } from '$lib/types';

// layer map list
export const layerList = writable(<Layer[]>[]);

// map store for maplibre-gl object
export * from './map';

// vector : sprite list
export const spriteImageList = writable(<SpriteImage[]>[]);

export const filterInputTags = writable([]);
