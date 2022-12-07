export const cleanText = (text: string | undefined) => {
	if (!text) return text;
	return text.replace(/\r?\n/g, '').trim();
};
