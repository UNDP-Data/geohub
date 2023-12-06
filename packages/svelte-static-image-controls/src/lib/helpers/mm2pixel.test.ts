import { describe, expect, it } from 'vitest';
import { mm2pixel } from './mm2pixel.js';

describe('mm2pixel conversion', () => {
	it('1189mm and 96 DPI', () => {
		const pixel = mm2pixel(1189, 96);
		expect(pixel).toBe(4494);
	});

	it('1189mm and 200 DPI', () => {
		const pixel = mm2pixel(1189, 200);
		expect(pixel).toBe(9362);
	});
});
