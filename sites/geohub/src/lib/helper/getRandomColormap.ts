import { SequentialColormaps, DivergingColorMaps, QualitativeColorMaps } from '$lib/colormaps';
/**
 * choose default colormap randomly
 * @returns colormap name
 */
export const getRandomColormap = (
	type: 'sequential' | 'diverging' | 'qualitative' = 'sequential'
) => {
	if (type === 'sequential') {
		return SequentialColormaps[Math.floor(Math.random() * SequentialColormaps.length)];
	} else if (type === 'diverging') {
		return DivergingColorMaps[Math.floor(Math.random() * DivergingColorMaps.length)];
	} else {
		return QualitativeColorMaps[Math.floor(Math.random() * QualitativeColorMaps.length)];
	}
};
