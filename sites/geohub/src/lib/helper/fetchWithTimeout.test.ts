import { describe, it, expect } from 'vitest';
import { fetchWithTimeout } from '$lib/helper';

describe.todo('fetchWithTimeout', () => {
	it('should return a promise', () => {
		const promise = fetchWithTimeout('https://example.com', {
			timeout: 1000
		});
		expect(promise).toBeInstanceOf(Promise);
	});
});
