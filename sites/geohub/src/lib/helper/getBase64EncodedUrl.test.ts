import { describe, it, expect } from 'vitest';
import { getBase64EncodedUrl } from '$lib/helper/getBase64EncodedUrl';

describe('getBase64EncodedUrl', () => {
	it('should return a base64 encoded url', () => {
		const url =
			'https://undpgeohub.blob.core.windows.net/userdata/a85516c81c0b78d3e89d3f00099b8b15/datasets/Dem_Rwanda_10m_allt_20230921150153.tif/Dem_Rwanda_10m_allt_20230921150153_band1.tif?sv=2023-11-03&ss=b&srt=o&se=2024-12-02T16%3A01%3A58Z&sp=r&sig=yKCoZklpzFdSn7mQnQ0%2BevKUkIukVVeq7Oy6XkNToBk%3D';
		const encodedUrl = getBase64EncodedUrl(url);
		expect(encodedUrl).toBe(
			'https://undpgeohub.blob.core.windows.net/userdata/a85516c81c0b78d3e89d3f00099b8b15/datasets/Dem_Rwanda_10m_allt_20230921150153.tif/Dem_Rwanda_10m_allt_20230921150153_band1.tif?c3Y9MjAyMy0xMS0wMyZzcz1iJnNydD1vJnNlPTIwMjQtMTItMDJUMTYlM0EwMSUzQTU4WiZzcD1yJnNpZz15S0NvWmtscHpGZFNuN21RblEwJTJCZXZLVWtJdWtWVmVxN095NlhrTlRvQmslM0Q='
		);
	});

	it('should return same URL if no query params', () => {
		const url = 'https://exampleurl.com';
		const encodedUrl = getBase64EncodedUrl(url);
		expect(encodedUrl).toBe(url);
	});
});
