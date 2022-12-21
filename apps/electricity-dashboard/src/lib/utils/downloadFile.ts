import mime from 'mime';

/**
 * Download a file
 * @param filename
 * @param content
 */
export const downloadFile = (filename: string, content?: string) => {
	const element = document.createElement('a');

	if (content) {
		const type = mime.getType(filename.split('.').pop());
		element.href = `data:${type};charset=utf-8,` + encodeURIComponent(content);
	} else {
		element.href = filename;
	}

	element.download = filename;
	element.click();
	element.remove();
};
