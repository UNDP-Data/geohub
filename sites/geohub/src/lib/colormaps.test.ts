import { describe, expect, it } from 'vitest';

import * as colormaps from '$lib/colormaps';
import { ColorMapTypes } from '$lib/config/AppConfig';

describe('colorMapStyle', () => {
	it('should return a string when color map type is sequential and card style', () => {
		const style = colormaps.colorMapStyle(ColorMapTypes.SEQUENTIAL, 'viridis', true);

		expect(style).toEqual(
			'height: calc(1px * 30); width: calc(2px * 30); background: linear-gradient(90deg, #3f4a8a,#2c768f,#1f9d8a,#96d647,#fee825);'
		);
	});

	it('should return a string when color map type is sequential and list style', () => {
		const style = colormaps.colorMapStyle(ColorMapTypes.SEQUENTIAL, 'viridis', false);

		expect(style).toEqual(
			'height: 15px; width:250px; background: linear-gradient(90deg, #3f4a8a,#2c768f,#1f9d8a,#96d647,#fee825); cursor: default !important;'
		);
	});
});
