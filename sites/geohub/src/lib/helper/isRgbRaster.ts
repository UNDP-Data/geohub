/**
 * Check if the dataset is RGB raster
 * @param colorinterp colorinterp value in raster statistics
 * @returns If true, it is RGB tile
 */
export const isRgbRaster = (colorinterp: string[]) => {
	const isRgbTile =
		colorinterp &&
		colorinterp.includes('red') &&
		colorinterp.includes('green') &&
		colorinterp.includes('blue');
	return isRgbTile;
};
