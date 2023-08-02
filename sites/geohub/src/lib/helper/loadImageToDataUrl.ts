export const loadImageToDataUrl = async (url: string): Promise<string> => {
	const blob = await fetch(url).then((r) => r.blob());
	return await new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
			}
		};
		reader.readAsDataURL(blob);
	});
};
