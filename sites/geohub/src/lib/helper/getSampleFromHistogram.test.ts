import { describe, expect, it } from 'vitest';

import { getSampleFromHistogram } from './getSampleFromHistogram';

describe('getSampleFromHistogram', () => {
	it('tilestats histogram) should have the length of the resulting array be equal to the numberOfSamples', () => {
		const histogram = {
			count: [32, 219, 316, 469, 351],
			bins: [
				0.22349999845027924, 0.3774999976158142, 0.5314999967813492, 0.6854999959468842,
				0.8394999951124191, 0.9934999942779541
			]
		};

		const samplesList = getSampleFromHistogram(histogram, 1000);
		expect(samplesList.length).toEqual(1000);
	});

	it('titiler histogram) should have the length of the resulting array be equal to the numberOfSamples', () => {
		const histogram = [
			[21, 15, 28832, 326202, 140385, 71575, 13629, 991, 759, 347],
			[100, 502.3, 904.6, 1306.9, 1709.2, 2111.5, 2513.8, 2916.1, 3318.4, 3720.7000000000003, 4123]
		];

		const samplesList = getSampleFromHistogram({ bins: histogram[1], count: histogram[0] }, 1000);
		expect(samplesList.length).toEqual(1000);
	});
});
