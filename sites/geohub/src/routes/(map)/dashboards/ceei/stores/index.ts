import type { Map, SourceSpecification, LayerSpecification } from 'maplibre-gl';
import { writable } from 'svelte/store';

// map store for maplibre-gl object
export const map = writable<Map>(undefined);

export interface Layer {
	name: string;
	sourceName: string;
	source: SourceSpecification;
	layerName: string;
	layer: LayerSpecification;
}

export const layers = writable<Layer[]>([]);
