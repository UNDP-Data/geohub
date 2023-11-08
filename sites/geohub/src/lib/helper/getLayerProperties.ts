import type { VectorLayerMetadata, VectorLayerTileStatLayer, VectorTileMetadata } from '$lib/types';
import type { Map } from 'maplibre-gl';
import { getLayerStyle } from './getLayerStyle';

export const getLayerProperties = (
	map: Map,
	layerId: string,
	metadata: VectorTileMetadata,
	onlyNumberFields = true
) => {
	const vectorInfo: VectorLayerMetadata[] = metadata.json.vector_layers;

	const vectorLayerMeta: VectorLayerMetadata = JSON.parse(
		JSON.stringify(vectorInfo.find((l) => l.id === getLayerStyle(map, layerId)['source-layer']))
	);

	const tilestats: {
		layerCount: number;
		layers: VectorLayerTileStatLayer[];
	} = metadata.json.tilestats;

	if (tilestats) {
		const vectorLayerStats = tilestats.layers.find(
			(l) => l.layer === getLayerStyle(map, layerId)['source-layer']
		);

		const fields = Object.keys(vectorLayerMeta.fields).filter((key) => {
			// const field = vectorLayerMeta.fields[key];
			const stat = vectorLayerStats.attributes.find((attr) => attr.attribute === key);
			const type = stat.type.toLowerCase();
			if (onlyNumberFields === true) {
				return type === 'number';
			} else {
				// not return boolean type
				return ['string', 'number'].includes(type);
			}
		});
		vectorLayerStats.attributes.forEach((attr) => {
			if (!fields.includes(attr.attribute)) {
				delete vectorLayerMeta.fields[attr.attribute];
			}
		});
	}

	return vectorLayerMeta;
};
