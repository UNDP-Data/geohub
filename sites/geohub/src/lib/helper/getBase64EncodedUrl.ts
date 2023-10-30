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
		return `${base}?${btoa(sign)}`;
	}
};
