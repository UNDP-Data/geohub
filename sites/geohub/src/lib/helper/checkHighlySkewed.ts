/**
 * calc skewness
 * https://community.gooddata.com/metrics-and-maql-kb-articles-43/normality-testing-skewness-and-kurtosis-241
 * If skewness is less than -1 or greater than 1, the distribution is highly skewed.
 * If skewness is between -1 and -0.5 or between 0.5 and 1, the distribution is moderately skewed.
 * If skewness is between -0.5 and 0.5, the distribution is approximately symmetric.
 * @param mean mean value
 * @param median median value
 * @param std std value
 * @returns
 */
export const calcSkewness = (mean: number, median: number, std: number) => {
	return 3 * ((mean - median) / std);
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
 * @returns return true if highly skewed
 */
export const isDataHighlySkewed = (mean: number, median: number, std: number) => {
	const skewness = calcSkewness(mean, median, std);
	const isHighlySkewed = skewness < -1 || skewness > 1;
	return isHighlySkewed;
};

/**
 * Check whether the data distribution is approximately symmetric
 * @param mean mean value
 * @param median median value
 * @param std std value
 * @returns if true, data is somehow skewed. if false, data distribution is symmetric
 */
export const isDataSkewed = (mean: number, median: number, std: number) => {
	const skewness = calcSkewness(mean, median, std);
	// console.log(skewness, mean, median, std);
	return !(skewness >= -0.1 && skewness <= 0.1);
	// return !(skewness >= -0.5 && skewness <= 0.5);
};
