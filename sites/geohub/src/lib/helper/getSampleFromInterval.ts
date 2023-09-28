import { isInt } from './isInt';
import { remapInputValue } from './remapInputValue';

export const getSampleFromInterval = (
	intervalStart: number,
	intervalEnd: number,
	numberOfItems: number
) => {
	const randomSamplesFromInterval: number[] = [];

	while (randomSamplesFromInterval.length < numberOfItems) {
		const randomValue = remapInputValue(Math.random(), 0, 1, intervalStart, intervalEnd);
		randomSamplesFromInterval.push(randomValue);
	}
	// if min and max are integer, assume all sampled values are also integer
	if (isInt(intervalStart) && isInt(intervalEnd)) {
		return randomSamplesFromInterval.map((v) => parseInt(`${v}`));
	} else {
		return randomSamplesFromInterval;
	}
};
