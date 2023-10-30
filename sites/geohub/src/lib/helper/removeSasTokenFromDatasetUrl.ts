/**
 * Clean URL of dataset properties
 * @param url URL string from dataset feature property
 * @returns url after removing sastoken of blob container
 */
export const removeSasTokenFromDatasetUrl = (url) => {
	const isPmtiles = url.indexOf('pmtiles://') !== -1 ? true : false;
	const _url = new URL(url.replace('pmtiles://', ''));
	return `${isPmtiles ? 'pmtiles://' : ''}${_url.origin}${_url.pathname}`;
};
