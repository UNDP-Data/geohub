import { describe, it, expect } from 'vitest';
import { getRandomColormap } from '$lib/helper';
import { SequentialColormaps, DivergingColorMaps, QualitativeColorMaps } from '$lib/colormaps';

describe('getRandomColormap', () => {
	const colorMaps = [...SequentialColormaps, ...DivergingColorMaps, ...QualitativeColorMaps];
	it('should return a random colormap from one of the colormaps in the colormaps array', () => {
		const randomColormap = getRandomColormap();
		expect(colorMaps).toContain(randomColormap);
	});
});
