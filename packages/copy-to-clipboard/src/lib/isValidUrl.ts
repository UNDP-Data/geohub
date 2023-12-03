/**
 * Check if string is valid URL
 * @param urlString URL string
 * @returns return true if string is valid URL
 */
export const isValidUrl = (urlString: string) => {
	try {
		return Boolean(new URL(urlString));
	} catch {
		return false;
	}
};
