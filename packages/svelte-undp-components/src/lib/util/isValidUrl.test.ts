import { describe, expect, it } from 'vitest';
import { isValidUrl } from './isValidUrl.js';

describe('Check URL is valid', () => {
	it('valid URL', () => {
		const isValid = isValidUrl('http://localhost:5173');
		expect(isValid).toBeTruthy();
	});

	it('invalid URL', () => {
		const isValid = isValidUrl('invalid URL');
		expect(isValid).toBeFalsy();
	});
});
