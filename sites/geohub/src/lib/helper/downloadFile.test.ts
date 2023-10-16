import { beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadFile } from './downloadFile';

describe('downloadFile', () => {
	let linkElement: HTMLAnchorElement;
	const link = {
		...linkElement,
		click: vi.fn(),
		remove: vi.fn(),
		download: '',
		href: ''
	};

	beforeEach(() => {
		vi.restoreAllMocks();
		linkElement = document.createElement('a') as HTMLAnchorElement;
	});

	it('should create an HTML element to download a file when content is available ', () => {
		vi.spyOn(document, 'createElement').mockReturnValue(link);
		downloadFile('test-file.txt', 'test content here');

		expect(link.download).toEqual('test-file.txt');
		expect(link.href).toEqual('data:text/plain;charset=utf-8,test%20content%20here');
		expect(link.click).toHaveBeenCalledTimes(1);
		expect(link.remove).toHaveBeenCalledTimes(1);
	});

	it('should create an HTML element to download a file when no content is available ', () => {
		vi.spyOn(document, 'createElement').mockReturnValue(link);
		downloadFile('test-file.txt');

		expect(link.download).toEqual('test-file.txt');
		expect(link.href).toEqual('test-file.txt');
		expect(link.click).toHaveBeenCalledTimes(1);
		expect(link.remove).toHaveBeenCalledTimes(1);
	});
});
