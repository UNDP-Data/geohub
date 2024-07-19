import type { Map, SourceSpecification, LngLatBoundsLike, AddLayerObject } from 'maplibre-gl';
import { writable } from 'svelte/store';

// map store for maplibre-gl object
export const map = writable<Map>(undefined);

export interface Layer {
	name: string;
	sourceId: string;
	source: SourceSpecification;
	layerId: string;
	layer: AddLayerObject;
	bounds: LngLatBoundsLike;
	data?;
	sliders?;
	muliplierMap?;
	isVisible: boolean;
	isMapLoaded: boolean;
	isDataLoaded: boolean;
}

export const layers = writable<Layer[]>([]);
