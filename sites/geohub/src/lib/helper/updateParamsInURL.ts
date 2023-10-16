import type {
	FillLayerSpecification,
	HeatmapLayerSpecification,
	LineLayerSpecification,
	RasterLayerSpecification,
	SymbolLayerSpecification
} from 'maplibre-gl';

import { get } from 'svelte/store';
import { loadMap } from './loadMap';
import type { MapStore } from '$stores';

export const updateParamsInURL = (
	layerStyle:
		| RasterLayerSpecification
		| LineLayerSpecification
		| FillLayerSpecification
		| SymbolLayerSpecification
		| HeatmapLayerSpecification,
	layerURL: URL,
	params: Record<string, string>,
	mapStore: MapStore
) => {
	Object.keys(params).forEach((key) => {
		layerURL.searchParams.set(key, params[key]);
	});
	const map = get(mapStore);
	if ('getStyle' in map) {
		const style = map.getStyle();

		if (style?.sources) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			style.sources[layerStyle.source].tiles = [decodeURI(layerURL.toString())];
			// delete all props which have undefined value
			// probably it is a bug of maplibre to add undefined property (like url, bounds) to the style,
			// and maplibre complains it has error which some of properties are not defined.
			Object.keys(style.sources).forEach((key) => {
				const src = style.sources[key];
				Object.keys(src).forEach((prop) => {
					if (!src[prop]) {
						delete src[prop];
					}
				});
			});
			map.setStyle(style);
		}
	}
};

export const updateLayerURL = async (
	layerStyle:
		| RasterLayerSpecification
		| LineLayerSpecification
		| FillLayerSpecification
		| SymbolLayerSpecification
		| HeatmapLayerSpecification,
	layerURL: URL,
	params: Record<string, string>,
	mapStore: MapStore
) => {
	const map = get(mapStore);
	updateParamsInURL(layerStyle, layerURL, params, mapStore);
	await loadMap(map);
	mapStore.set(map);
};
