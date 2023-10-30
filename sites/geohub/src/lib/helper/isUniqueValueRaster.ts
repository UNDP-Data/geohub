import type { BandMetadata, RasterTileMetadata } from '$lib/types';
import { getActiveBandIndex } from './getActiveBandIndex';

export const isUniqueValueRaster = (metadata: RasterTileMetadata) => {
	const bandIndex = getActiveBandIndex(metadata);
	const bandMetaStats =
		bandIndex > -1 ? (metadata['band_metadata'][bandIndex][1] as BandMetadata) : undefined;
	const layerHasUniqueValues =
		bandMetaStats &&
		bandMetaStats['STATISTICS_UNIQUE_VALUES'] &&
		Object.keys(bandMetaStats['STATISTICS_UNIQUE_VALUES']).length > 0;
	return layerHasUniqueValues;
};
