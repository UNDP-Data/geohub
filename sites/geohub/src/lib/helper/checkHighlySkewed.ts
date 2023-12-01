/**
 * calc median skewness
 * https://community.gooddata.com/metrics-and-maql-kb-articles-43/normality-testing-skewness-and-kurtosis-241
 * If skewness is less than -1 or greater than 1, the distribution is highly skewed.
 * If skewness is between -1 and -0.5 or between 0.5 and 1, the distribution is moderately skewed.
 * If skewness is between -0.5 and 0.5, the distribution is approximately symmetric.
 * @param mean mean value
 * @param median median value
 * @param std std value
 * @returns
 */
export const calcMedianSkewness = (mean: number, median: number, std: number) => {
	return 3 * ((mean - median) / std);
};

/**
 * calc mode skewness
 *
 * https://en.wikipedia.org/wiki/Skewness
 * @param mean mean value
 * @param std std value
 * @param histogramData histogram data from /statistics api of titiler
 * @returns
 */
export const calcModeSkewness = (mean: number, std: number, histogramData: number[][]) => {
	const modeIndex = histogramData[0].indexOf(Math.max(...histogramData[0]));

	// use average value of min/max as mode value
	const modevalue = (histogramData[1][modeIndex] + histogramData[1][modeIndex + 1]) / 2;

	const skewness = (mean - modevalue) / std;
	// console.log(skewness, mean, modevalue, std, modeIndex);
	return skewness;
};

/**
 * Check whether the data is highly skewed
 *
 * https://community.gooddata.com/metrics-and-maql-kb-articles-43/normality-testing-skewness-and-kurtosis-241
 * If skewness is less than -1 or greater than 1, the distribution is highly skewed.
 * If skewness is between -1 and -0.5 or between 0.5 and 1, the distribution is moderately skewed.
 * If skewness is between -0.5 and 0.5, the distribution is approximately symmetric.
 * @param mean mean value
 * @param median median value
 * @param std std value
 * @param histogramData optional parameter. If used, compute mode skewness instead of median skewness
 * @returns return true if highly skewed
 */
export const isDataHighlySkewed = (
	mean: number,
	median: number,
	std: number,
	histogramData?: number[][]
) => {
	const skewness = histogramData
		? calcModeSkewness(mean, std, histogramData)
		: calcMedianSkewness(mean, median, std);
	const isHighlySkewed = skewness < -1 || skewness > 1;
	return isHighlySkewed;
};

/**
 * Check whether the data distribution is approximately symmetric
 * @param mean mean value
 * @param median median value
 * @param std std value
 * @param histogramData optional parameter. If used, compute mode skewness instead of median skewness
 * @returns if true, data is somehow skewed. if false, data distribution is symmetric
 */
export const isDataSkewed = (
	mean: number,
	median: number,
	std: number,
	histogramData?: number[][]
) => {
	const skewness = histogramData
		? calcModeSkewness(mean, std, histogramData)
		: calcMedianSkewness(mean, median, std);
	// console.log(skewness, mean, median, std);
	// return !(skewness >= -0.1 && skewness <= 0.1);
	return !(skewness >= -0.5 && skewness <= 0.5);
};
