import { getSampleFromInterval } from './getSampleFromInterval';

/**
 * get sampled values according to actual data distribution of histogram
 * @param histogram histogram data with count and bins
 * @param numberOfSamples the number of sampled items (eg., 1000)
 * @param min Optional. To ensure samples to be less than or equal to min value
 * @param max Optional. To ensure samples to be more than or equal to max value
 * @returns an array of sampled numbers based on data distribution of histogram.
 */
export const getSampleFromHistogram = (
	histogram: { bins: number[]; count: number[] },
	numberOfSamples: number,
	min?: number,
	max?: number
) => {
	const totalCount = histogram.count.reduce((acc, count) => acc + count, 0);
	const probabilities = histogram.count.map((count) => count / totalCount);
	const sampleCount = probabilities.map((p) => Math.round(p * numberOfSamples));

	// make a list of min/max for each count
	const ranges: number[][] = [];
	for (let i = 0; i < histogram.bins.length - 1; i++) {
		const _min = histogram.bins[i];
		const _max = histogram.bins[i + 1];
		ranges.push([_min, _max]);
	}

	// get random sampled values from min/max for each count
	const result: number[] = [];
	ranges.forEach((range, index) => {
		let start = range[0];
		let end = range[1];

		if (min !== undefined && max !== undefined) {
			// if min and max are passed, make sure returning samples within the range
			if (!isBetween(start, min, max) && !isBetween(end, min, max)) {
				// if both are out of ranges, skip to next.
				return;
			}
			if (!isBetween(start, min, max)) {
				// if start is out of ranges, use min instead
				start = min;
			}
			if (!isBetween(end, min, max)) {
				// if end is out of ranges, use max instead
				end = max;
			}
		}
		const values = getSampleFromInterval(start, end, sampleCount[index]);
		result.push(...values);
	});
	return result;
};

const isBetween = (val: number, min: number, max: number) => {
	return val >= min && val <= max;
};
