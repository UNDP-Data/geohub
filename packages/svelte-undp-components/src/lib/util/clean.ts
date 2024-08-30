/**
 * Remove underscore and extension and apply start/title case to a string
 * @param val String to clean
 */
export const clean = (val: string, isUppercase = true) => {
	if (!val) return '';
	// apply start/title case
	return val
		.replace(/[_-]/g, ' ') // remove underscore and hyphen
		.replace(/\.[^/.]+$/, '') // remove extension
		.replace(/\b\w/g, (str) => (isUppercase ? str.toUpperCase() : str));
};
