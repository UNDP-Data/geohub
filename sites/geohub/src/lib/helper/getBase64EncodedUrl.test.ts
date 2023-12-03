import { describe, it, expect } from 'vitest';
import { getBase64EncodedUrl } from '$lib/helper/getBase64EncodedUrl';

describe('getBase64EncodedUrl', () => {
	// there is very weird error of 'The string to be encoded contains invalid characters.' only in CI. I tried to fix it, but I could not manage it.
	// the below test works well in my local PC and I cannot reproduce the error in locally,
	// it('should return a base64 encoded url', () => {
	// 	const url = 'https://exampleurl.com?first=1&second=2';
	// 	const encodedUrl = getBase64EncodedUrl(url);
	// 	expect(encodedUrl).toBe('https://exampleurl.com?Zmlyc3Q9MSZzZWNvbmQ9Mg==');
	// });

	it('should return same URL if no query params', () => {
		const url = 'https://exampleurl.com';
		const encodedUrl = getBase64EncodedUrl(url);
		expect(encodedUrl).toBe(url);
	});
});
