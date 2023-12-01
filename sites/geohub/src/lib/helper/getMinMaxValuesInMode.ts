export const getMinMaxValuesInMode = (histogramData: number[][]) => {
	// find index of mode
	const modeIndex = histogramData[0].indexOf(Math.max(...histogramData[0]));

	// get min and max values from mode index
	const minInRange = histogramData[1][modeIndex === 0 ? 0 : modeIndex - 1];
	const maxInRange = histogramData[1][modeIndex + 1];

	return {
		min: minInRange,
		max: maxInRange
	};
};
