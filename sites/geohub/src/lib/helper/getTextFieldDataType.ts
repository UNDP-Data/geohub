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
	// console.log(JSON.stringify(tilestats, null, '\t'));
	if (tilestats) {
		const tileStatLayer = tilestats?.layers.find(
			(tileLayer: VectorLayerTileStatLayer) =>
				tileLayer.layer == getLayerStyle(map, layer.id)['source-layer']
		);

		if (tileStatLayer) {
			const tileStatLayerAttribute: VectorLayerTileStatAttribute = tileStatLayer.attributes.find(
				(val: VectorLayerTileStatAttribute) => val.attribute === fieldName
			);

			if (tileStatLayerAttribute) {
				let atype = tileStatLayerAttribute.type;
				if (tileStatLayerAttribute.type === 'number') {
					if (tileStatLayerAttribute.values && tileStatLayerAttribute.values.length > 0) {
						tileStatLayerAttribute.values.forEach((val: number) => {
							atype = isInt(val) ? 'integer' : 'float';
						});
					} else if (tileStatLayerAttribute.min) {
						atype = isInt(tileStatLayerAttribute.min) ? 'integer' : 'float';
					} else {
						atype = 'integer';
					}
				}

				return atype;
			}
		}
	}
};
