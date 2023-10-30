import { describe, it, expect } from 'vitest';
import { createAttributionFromTags } from '$lib/helper';

describe('createAttributionFromTags', () => {
	it('should return a single string', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const result = createAttributionFromTags([
			{ key: 'provider', value: 'provider1' },
			{ key: 'provider', value: 'provider2' }
		]);
		expect(result).toBe('provider1,provider2');
	});
});
