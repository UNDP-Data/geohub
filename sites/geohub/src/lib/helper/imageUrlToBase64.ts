/**
 * Convert Image URL to base 64 data URL
 * @param url Image URL. If it is not url, it consider it is already in DataURL, and just return the same URL value given.
 * @returns Data URL
 */
export const imageUrlToBase64 = async (url: string): Promise<string> => {
	if (url.startsWith('http://') || url.startsWith('https://')) {
		const data = await fetch(url);
		const blob = await data.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = () => {
				const base64data = reader.result as string;
				resolve(base64data);
			};
			reader.onerror = reject;
		});
	} else {
		return url;
	}
};
