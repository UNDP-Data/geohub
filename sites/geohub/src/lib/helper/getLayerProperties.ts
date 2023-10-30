import type { VectorLayerMetadata, VectorLayerTileStatLayer, VectorTileMetadata } from '$lib/types';
import type { Map } from 'maplibre-gl';
import { getLayerStyle } from './getLayerStyle';
import { UniqueValueThreshold } from '$lib/config/AppConfig';

export const getLayerProperties = (
	map: Map,
	layerId: string,
	metadata: VectorTileMetadata,
	inLegend = true
) => {
	const vectorInfo: VectorLayerMetadata[] = metadata.json.vector_layers;

	// let layerId = layer.id;
	// if (layer.parentId) {
	// 	layerId = layer.parentId;
	// }

	const vectorLayerMeta: VectorLayerMetadata = JSON.parse(
		JSON.stringify(vectorInfo.find((l) => l.id === getLayerStyle(map, layerId)['source-layer']))
	);

	if (inLegend === true) {
		const tilestats: {
			layerCount: number;
			layers: VectorLayerTileStatLayer[];
		} = metadata.json.tilestats;

		if (tilestats) {
			const vectorLayerStats = tilestats.layers.find(
				(l) => l.layer === getLayerStyle(map, layerId)['source-layer']
			);
			vectorLayerStats.attributes.forEach((attr) => {
				if (attr.type.toLowerCase() === 'string' && attr.values?.length > UniqueValueThreshold) {
					delete vectorLayerMeta.fields[attr.attribute];
				}
			});
		}
	}
	return vectorLayerMeta;
};
