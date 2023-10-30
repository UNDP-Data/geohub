import chroma from 'chroma-js';
import { ColorMapTypes } from '$lib/config/AppConfig';

export const SequentialColormaps = [
	'pubu',
	'ylgn',
	'greys',
	'rdpu',
	'pubugn',
	'oranges',
	'gnbu',
	'purples',
	'blues',
	'bugn',
	'reds',
	'ylorbr',
	'ylgnbu',
	'viridis',
	'orrd',
	'greens',
	'bupu'
];

export const DivergingColorMaps = [
	'rdgy',
	'spectral',
	'puor',
	'piyg',
	'brbg',
	'prgn',
	'rdbu',
	'rdylbu',
	'rdylgn'
];

export const QualitativeColorMaps = [
	'accent',
	'set1',
	'set2',
	'set3',
	'pastel2',
	'pastel1',
	'dark2',
	'paired'
];

export const ColorMaps = {
	sequential: SequentialColormaps,
	diverging: DivergingColorMaps,
	qualitative: QualitativeColorMaps
};

/**
 * Returns an style based on a color map name
 * @param colorMapType Color map type (e.x.:  sequential, diverging, qualitative)
 * @param colorMapName Color map name (e.x.: viridis)
 * @param isCardStyle Card style (card or list)
 * @returns string
 */
export const colorMapStyle = (
	colorMapType: ColorMapTypes,
	colorMapName: string,
	isCardStyle: boolean,
	isReverseColors = false
) => {
	let colorMap = [];
	let style = '';
	const numberOfClasses = 5;
	if (colorMapType === ColorMapTypes.SEQUENTIAL) {
		colorMap = chroma
			.scale(colorMapName)
			.mode('lrgb')
			.padding([0.25, 0]) // this is necessary to create better looking color ramps graphics
			.colors(numberOfClasses, 'rgba');
	} else {
		colorMap = chroma.scale(colorMapName).mode('lrgb').colors(numberOfClasses, 'rgba');
	}

	if (isReverseColors) {
		colorMap = colorMap.reverse();
	}

	if (isCardStyle) {
		style = `height: calc(1px * 30); width: calc(2px * 30); background: linear-gradient(90deg, ${colorMap});`;
	} else {
		style = `height: 15px; width:250px; background: linear-gradient(90deg, ${colorMap}); cursor: default !important;`;
	}

	return style;
};
