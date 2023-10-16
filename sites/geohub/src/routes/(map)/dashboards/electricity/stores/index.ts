import type { Map } from 'maplibre-gl';
import { writable } from 'svelte/store';
import type { Dataset } from '../interfaces';

// map store for maplibre-gl object
export const map = writable<Map>(undefined);

export const admin = writable({});

export const hrea = writable<Dataset[]>(undefined);
export const ml = writable<Dataset[]>(undefined);
