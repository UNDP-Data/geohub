import { expect, describe, it } from 'vitest';
import { fetchUrl } from '$lib/helper';

describe.todo('fetchUrl', () => {
	it('should return a promise', () => {
		const promise = fetchUrl('https://example.com');
		expect(promise).toBeInstanceOf(Promise);
	});
});
