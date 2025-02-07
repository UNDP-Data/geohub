import type {
	Map,
	LngLatBoundsLike,
	AddLayerObject,
	Popup,
	GeoJSONSourceSpecification
} from 'maplibre-gl';
import { writable } from 'svelte/store';

export const mapPopup = writable<Popup>(undefined);

export interface Layer {
	name: string;
	sourceId: string;
	source: GeoJSONSourceSpecification;
	layerId: string;
	layer: AddLayerObject;
	bounds: LngLatBoundsLike;
	data: object[];
	sliders?: {
		id: number;
		percentage: number;
		label: string;
		locked: boolean;
	}[];
	muliplierMap?: Map;
	isVisible: boolean;
	isMapLoaded: boolean;
	isDataLoaded: boolean;
	colorMap: string;
}

export const layers = writable<Layer[]>([]);
