import type {
	Map,
	SourceSpecification,
	LngLatBoundsLike,
	AddLayerObject,
	Popup
} from 'maplibre-gl';
import { writable } from 'svelte/store';

// map store for maplibre-gl object
export const map = writable<Map>(undefined);
export const mapPopup = writable<Popup>(undefined);

export interface Layer {
	name: string;
	sourceId: string;
	source: SourceSpecification;
	layerId: string;
	layer: AddLayerObject;
	bounds: LngLatBoundsLike;
	data: object[];
	sliders?;
	muliplierMap?;
	isVisible: boolean;
	isMapLoaded: boolean;
	isDataLoaded: boolean;
	colorMap: string;
}

export const layers = writable<Layer[]>([]);
