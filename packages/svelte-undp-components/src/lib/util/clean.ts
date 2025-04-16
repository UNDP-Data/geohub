/**
 * Remove underscore and extension and apply start/title case to a string
 * @param val String to clean
 */
export const clean = (val: string, isUppercase = true, removeExtension = true) => {
	if (!val) return '';
	// apply start/title case
	let result = val.replace(/[_-]/g, ' '); // remove underscore and hyphen

	if (removeExtension) {
		result = result.replace(/\.[^/.]+$/, '');
	}

	result = result.replace(/\b\w/g, (str) => (isUppercase ? str.toUpperCase() : str));

	return result;
};
