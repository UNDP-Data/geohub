export const isRasterExtension = (name: string) => {
	const splitAt = name.lastIndexOf('.');
	const ext = name.slice(splitAt, name.length);
	const extensions = ['.tif', '.tiff'];
	const v = extensions.includes(ext.toLowerCase());
	return v;
};
