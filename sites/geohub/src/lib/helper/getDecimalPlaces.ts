/**
 * Get the decimal place of the float number
 * @param value Number value
 * @returns return the decimal place of the float number
 */
export const getDecimalPlaces = (value: number) => {
	let decimalPlaces = 0;

	if (value !== undefined && typeof value === 'number') {
		const valueString = value.toString();
		if (valueString.includes('.')) {
			decimalPlaces = valueString.split('.')[1].length;
		}
	}
	return decimalPlaces;
};
