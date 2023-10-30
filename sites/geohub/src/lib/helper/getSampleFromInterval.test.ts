import { describe, expect, it } from 'vitest';

import { getSampleFromInterval } from './getSampleFromInterval';

describe('getSampleFromInterval', () => {
	it('should have the length of the resulting array be equal to the numberOfItems', () => {
		const samplesList = getSampleFromInterval(0, 1, 1000);
		expect(samplesList.length).toEqual(1000);
	});
});
