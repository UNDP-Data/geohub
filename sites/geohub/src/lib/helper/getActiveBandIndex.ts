import type { RasterTileMetadata } from '$lib/types';

/**
 * Get active band index number from RasterTileMetadata object
 * if `active_band_no` property is not defined, 0 is returned as default.
 * @param metadata RasterTileMetadata object
 * @returns active band index number
 */
export const getActiveBandIndex = (metadata: RasterTileMetadata) => {
	let bandIndex = -1;
	if (!metadata) {
		return 0;
	}
	if (metadata.active_band_no) {
		bandIndex = Object.keys(metadata.band_metadata).indexOf(metadata.active_band_no);
		for (let i = 0; i < metadata.band_metadata.length; i++) {
			const band = metadata.band_metadata[i][0] as string;
			if (band == metadata.active_band_no) {
				bandIndex = i;
				break;
			}
		}
	} else {
		bandIndex = 0;
		metadata.active_band_no = metadata.band_metadata[bandIndex][0] as string;
	}
	return bandIndex;
};
