import { describe, it, expect } from 'vitest';
import { getMaxValueOfCharsInIntervals } from '$lib/helper';
import type { ColorMapRow } from '$lib/types';

describe('getMaxValueOfCharsInIntervals', () => {
	it('should return the maximum number of characters in the start and end of the colormap rows', () => {
		const colorMapRows: ColorMapRow[] = [
			{ start: 0, end: 10, color: [255, 255, 0] },
			{ start: 10, end: 20, color: [0, 255, 0] },
			{ start: 20, end: 30, color: [0, 0, 255] }
		];
		expect(getMaxValueOfCharsInIntervals(colorMapRows)).toBe(2);
	});
});
