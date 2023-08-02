import { describe, it, expect } from 'vitest';
import { distinct } from '$lib/helper';

describe('distinct', () => {
	it('should return a boolean', () => {
		const result = distinct('value', 0, ['value']);
		expect(result).toBe(true);
	});
});
