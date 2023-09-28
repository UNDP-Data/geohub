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
	return randomSamplesFromInterval;
};
