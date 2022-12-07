export const cleanName = (text: string | undefined) => {
	if (!text) return '';
	return text
		.replace(/\r?\n/g, '')
		.replace(/\r?_/g, ' ')
		.replace(/\r?-/g, ' ')
		.replace(/\.[^/.]+$/, '')
		.trim();
};
