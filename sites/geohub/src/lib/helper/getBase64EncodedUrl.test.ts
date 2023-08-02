import { describe, it, expect } from 'vitest';
import { getBase64EncodedUrl } from '$lib/helper/getBase64EncodedUrl';

describe('getBase64EncodedUrl', () => {
	it('should return a base64 encoded url', () => {
		const url = 'https://exampleurl.com?first=1&second=2';
		const encodedUrl = getBase64EncodedUrl(url);
		expect(encodedUrl).toBe('https://exampleurl.com?Zmlyc3Q9MSZzZWNvbmQ9Mg==');
	});
});
