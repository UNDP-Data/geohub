import { describe, it, expect } from 'vitest';
import { getBulmaTagColor } from '$lib/helper';
import { colorOptions } from '$lib/helper';

describe('getBulmaTagColor', () => {
	it('should return a string', () => {
		const color = getBulmaTagColor();
		expect(colorOptions).toContain(color);
	});
});
