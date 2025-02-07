import { describe, expect, it } from 'vitest';

import { remapInputValue } from './remapInputValue';

describe('remapInputValue', () => {
	it('should remap with default scale (0 / 255)', () => {
		const value = remapInputValue(150, 100, 200);
		expect(Math.floor(value)).toEqual(127);
	});

	it('should remap with new scale', () => {
		const value = remapInputValue(15, 5, 200, 50, 1000);
		expect(Math.floor(value)).toEqual(98);
	});
});
