import type { Map } from 'maplibre-gl';
import { writable } from 'svelte/store';
import type { DashBoardDataset } from '../+page@.svelte';

// map store for maplibre-gl object
export const map = writable<Map>(undefined);

export const admin = writable({});

export const hrea = writable<DashBoardDataset[]>(undefined);

export const colorMap = writable({
	value: 'pubu',
	isReversed: false
});

export const selectedAdminDataset = writable<
	| 'Settlement-Level Electricity Access'
	| 'Electricity Access Forecast'
	| 'Electricity Access with Wealth indicator'
	| undefined
>(undefined);
