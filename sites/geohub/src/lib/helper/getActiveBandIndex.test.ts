import { describe, it, expect } from 'vitest';
import { getActiveBandIndex } from './getActiveBandIndex';
import type { RasterTileMetadata } from '$lib/types';

describe('getActiveBandIndex', () => {
	it('should return the index of the active band', () => {
		const metadata: RasterTileMetadata = {
			band_metadata: [
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				['1', { band: '1', description: 'Band 1' }],
				['2', { band: '2', description: 'Band 2' }],
				['3', { band: '3', description: 'Band 3' }]
			]
		};
		expect(getActiveBandIndex(metadata)).toBe(0);
	});
});
