import { describe, it, expect } from 'vitest';
import { clipSprite } from '$lib/helper';

describe.todo('clipSprite', () => {
	it('should return a promise', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const promise = clipSprite('https://example.com', 'id', {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		});
		expect(promise).toBeInstanceOf(Promise);
	});
});
