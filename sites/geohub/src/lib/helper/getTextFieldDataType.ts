import type {
	Layer,
	VectorLayerTileStatAttribute,
	VectorLayerTileStatLayer,
	VectorTileMetadata
} from '$lib/types';
import { isInt } from '@undp-data/svelte-undp-components';
import { getLayerStyle } from './getLayerStyle';
import type { Map } from 'maplibre-gl';

export const getTextFieldDataType = (map: Map, layer: Layer, fieldName: string) => {
	const vectorInfo = layer?.info as VectorTileMetadata;
	const tilestats = vectorInfo?.json?.tilestats;
	if (tilestats) {
		const tileStatLayer = tilestats?.layers.find(
			(tileLayer: VectorLayerTileStatLayer) =>
				tileLayer.layer == getLayerStyle(map, layer.id)['source-layer']
		);
		if (tileStatLayer) {
			const tileStatLayerAttribute = tileStatLayer.attributes.find(
				(val: VectorLayerTileStatAttribute) => val.attribute === fieldName
			);
			if (tileStatLayerAttribute) {
				let type = tileStatLayerAttribute.type;
				if (tileStatLayerAttribute.type === 'number') {
					if (tileStatLayerAttribute.values && tileStatLayerAttribute.values.length > 0) {
						tileStatLayerAttribute.values.forEach((val: number) => {
							type = isInt(val) ? 'interger' : 'float';
						});
					} else if (tileStatLayerAttribute.min) {
						type = isInt(tileStatLayerAttribute.min) ? 'interger' : 'float';
					} else {
						type = 'integer';
					}
				}
				return type;
			}
		}
	}
};
