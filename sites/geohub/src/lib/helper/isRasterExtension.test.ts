import { describe, it, expect } from 'vitest';
import { isRasterExtension } from '$lib/helper';

describe('isRasterExtension', () => {
	const testGeotiff = 'test.tif';
	const testGeotiff2 = 'test.tiff';
	const testShapefile = 'test.shp';
	it('should return true if the file name ends with .tif', () => {
		const result = isRasterExtension(testGeotiff);
		expect(result).toBe(true);
	});
	it('should return true if file name ends in tiff', () => {
		const result = isRasterExtension(testGeotiff2);
		expect(result).toBe(true);
	});
	it('should return false if file name does not end in tif or tiff', () => {
		const result = isRasterExtension(testShapefile);
		expect(result).toBe(false);
	});
});
