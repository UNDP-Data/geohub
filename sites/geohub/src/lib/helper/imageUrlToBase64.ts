/**
 * Convert Image URL to base 64 data URL
 * @param url Image URL
 * @returns Data URL
 */
export const imageUrlToBase64 = async (url: string): Promise<string> => {
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
};
