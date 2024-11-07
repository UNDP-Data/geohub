/**
 * Check whether URL is valid
 * @param value URL string
 * @param extensions Optional. Check valid extensions in URL if specified
 * @returns boolean
 */
export const isValidUrl = (value: string, extensions: string[] = []) => {
	let url;

	try {
		url = new URL(value);
	} catch {
		return false;
	}

	if (extensions.length > 0) {
		const parts = url.pathname.split('.');
		if (parts.length === 0) return false;
		const extension = parts[parts.length - 1];
		if (!extensions.includes(extension)) {
			return false;
		}
	}

	return url.protocol === 'http:' || url.protocol === 'https:';
};
