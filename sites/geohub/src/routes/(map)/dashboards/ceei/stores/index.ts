import type { Map, SourceSpecification, LayerSpecification, LngLatBoundsLike } from 'maplibre-gl';
import { writable } from 'svelte/store';

// map store for maplibre-gl object
export const map = writable<Map>(undefined);

export interface Layer {
	name: string;
	sourceId: string;
	source: SourceSpecification;
	layerId: string;
	layer: LayerSpecification;
	bounds: LngLatBoundsLike;
	data?;
	isVisible: boolean;
	isMapLoaded: boolean;
	isDataLoaded: boolean;
}

export const layers = writable<Layer[]>([]);
