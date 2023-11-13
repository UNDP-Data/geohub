import type {
	VectorLayerTileStatAttribute,
	VectorLayerTileStatLayer,
	VectorTileMetadata
} from '$lib/types';

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
				const skewness = 3 * ((stat['mean'] - stat['median']) / stat['std']);
				// https://community.gooddata.com/metrics-and-maql-kb-articles-43/normality-testing-skewness-and-kurtosis-241
				// If skewness is less than -1 or greater than 1, the distribution is highly skewed.
				// If skewness is between -1 and -0.5 or between 0.5 and 1, the distribution is moderately skewed.
				// If skewness is between -0.5 and 0.5, the distribution is approximately symmetric.
				isHighlySkewed = skewness < -1 && skewness > 1;
			}
		}
	}
	return isHighlySkewed;
};
