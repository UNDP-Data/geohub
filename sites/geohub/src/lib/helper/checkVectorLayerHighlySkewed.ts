import type {
	VectorLayerTileStatAttribute,
	VectorLayerTileStatLayer,
	VectorTileMetadata
} from '$lib/types';
import { isDataHighlySkewed } from './checkHighlySkewed';

/**
 * Check whether a property of a vector layer has highly skewed value
 * @param metadata VectorTileMetadata object
 * @param sourceLayer source-layer id
 * @param property property name
 * @returns boolean
 */
export const checkVectorLayerHighlySkewed = (
	metadata: VectorTileMetadata,
	sourceLayer: string,
	property: string
) => {
	let isHighlySkewed = false;
	const tilestats = metadata.json?.tilestats;
	if (tilestats) {
		const tileStatLayer = tilestats?.layers.find(
			(tileLayer: VectorLayerTileStatLayer) => tileLayer.layer == sourceLayer
		);
		if (tileStatLayer) {
			const tileStatLayerAttribute = tileStatLayer.attributes.find(
				(val: VectorLayerTileStatAttribute) => val.attribute === property
			);
			if (tileStatLayerAttribute) {
				const stats = metadata.json.tilestats?.layers.find((l) => l.layer === sourceLayer);
				const stat = stats?.attributes.find(
					(val) => val.attribute === tileStatLayerAttribute.attribute
				);
				isHighlySkewed = isDataHighlySkewed(stat['mean'], stat['median'], stat['std']);
			}
		}
	}
	return isHighlySkewed;
};
