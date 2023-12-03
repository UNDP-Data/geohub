/**
 * Get URL with base 64 encoded signature
 * @param url url with signature
 * @returns url after base 64 encoded signature
 */
export const getBase64EncodedUrl = (url: string) => {
	const parts = url.split('?');
	if (parts.length === 1) {
		return url;
	} else {
		const [base, sign] = parts;
		// an error of 'The string to be encoded contains invalid characters.' occurs in CI.
		// See this to fix. https://www.sitepoint.com/community/t/escape-unescape-depreciated-whats-the-alternative/230504/7
		return `${base}?${btoa(decodeURIComponent(encodeURIComponent(sign)))}`;
	}
};
