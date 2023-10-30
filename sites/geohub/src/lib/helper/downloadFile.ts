/**
 * Download a file
 * @param filename
 * @param content
 */
export const downloadFile = (filename: string, content?: string) => {
	const element = document.createElement('a');

	if (content) {
		const type = filename.split('.').pop();
		let mimeType = type;
		if (type === 'txt') {
			mimeType = 'text/plain';
		}
		element.href = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
	} else {
		element.href = filename;
	}

	element.download = filename;
	element.click();
	element.remove();
};
