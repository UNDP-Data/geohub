import { describe, it, expect } from 'vitest';
import { isInt } from '$lib/helper';

describe('isInt test', () => {
	it('should return true if the value is integer', () => {
		const result = isInt(10);
		expect(result).toBe(true);
	});
	it('should return false if the value is float', () => {
		const result = isInt(10.5);
		expect(result).toBe(false);
	});
});
