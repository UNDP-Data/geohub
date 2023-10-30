/**
 * Rescale input value based on min/max of old/new scale
 * @param input
 * @param oldMin
 * @param oldMax
 * @param newMin
 * @param newMax
 */
export const remapInputValue = (input = 0, oldMin = 0, oldMax = 0, newMin = 0, newMax = 255) => {
	const percent = (input - oldMin) / (oldMax - oldMin);
	return percent * (newMax - newMin) + newMin;
};
