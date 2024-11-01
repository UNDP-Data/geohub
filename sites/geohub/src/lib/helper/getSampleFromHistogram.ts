import { getSampleFromInterval } from './getSampleFromInterval';

/**
 * get sampled values according to actual data distribution of histogram
 * @param histogram histogram data with count and bins
 * @param numberOfSamples the number of sampled items (eg., 1000)
 * @returns an array of sampled numbers based on data distribution of histogram.
 */
export const getSampleFromHistogram = (
	histogram: { bins: number[]; count: number[] },
	numberOfSamples: number
) => {
	const totalCount = histogram.count.reduce((acc, count) => acc + count, 0);
	const probabilities = histogram.count.map((count) => count / totalCount);
	const sampleCount = probabilities.map((p) => Math.round(p * numberOfSamples));

	// make a list of min/max for each count
	const ranges: number[][] = [];
	for (let i = 0; i < histogram.bins.length - 1; i++) {
		const min = histogram.bins[i];
		const max = histogram.bins[i + 1];
		ranges.push([min, max]);
	}

	// get random sampled values from min/max for each count
	const result: number[] = [];
	ranges.forEach((range, index) => {
		const values = getSampleFromInterval(range[0], range[1], sampleCount[index]);
		result.push(...values);
	});

	return result;
};
