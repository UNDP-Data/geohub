import type { ColorMapRow } from '$lib/types';
import chroma from 'chroma-js';
import { getSampleFromInterval } from './getSampleFromInterval';
import { getSampleFromHistogram } from './getSampleFromHistogram';
import { getIntervalList } from './getIntervalList';
import { NumberOfRandomSamplingPoints } from '$lib/config/AppConfig';
import type { ClassificationMethodTypes } from '@undp-data/svelte-undp-components';

export const generateColorMap = (
	layerMin: number,
	layerMax: number,
	colorMapRows: ColorMapRow[],
	numberOfClasses: number,
	classificationMethod: ClassificationMethodTypes,
	isClassificationMethodEdited: boolean,
	percentile98: number,
	colorMapName: string,
	histogram?: { bins: number[]; count: number[] }
) => {
	const colorMap = [];
	const isReverse = colorMapName.indexOf('_r') !== -1;
	const scales = chroma.scale(colorMapName.replace('_r', ''));
	if (classificationMethod === ClassificationMethodTypes.LOGARITHMIC) {
		let randomSample: number[] = [];
		if (histogram) {
			randomSample = getSampleFromHistogram(
				histogram,
				NumberOfRandomSamplingPoints,
				layerMin,
				percentile98
			);
		}
		if (randomSample.length === 0) {
			randomSample = getSampleFromInterval(layerMin, percentile98, NumberOfRandomSamplingPoints);
		}
		const intervalList = getIntervalList(
			classificationMethod,
			layerMin,
			percentile98,
			randomSample,
			numberOfClasses
		);
		let scaleColorList = scales.colors(intervalList.length, 'rgb');
		if (isReverse) {
			scaleColorList = scaleColorList.reverse();
		}
		for (let i = 0; i <= numberOfClasses - 2; i++) {
			const row: ColorMapRow = {
				index: i,
				color: [...scaleColorList[i], 1],
				start:
					isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.start
						? colorMapRows[i].start
						: intervalList[i],
				end:
					isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.end
						? colorMapRows[i].end
						: intervalList[i + 1]
			};
			colorMap.push(row);
		}
		const lastRow: ColorMapRow = {
			index: numberOfClasses - 1,
			color: [...scaleColorList[numberOfClasses - 1], 1],
			start: Math.floor(percentile98),
			end: Math.ceil(layerMax)
		};
		colorMap.push(lastRow);
		const replaceIndex = colorMap[colorMap.length - 2];

		replaceIndex['end'] = Math.floor(percentile98);
		colorMap.splice(colorMap.length - 2, replaceIndex);
	} else {
		let randomSample: number[] = [];
		if (histogram) {
			randomSample = getSampleFromHistogram(
				histogram,
				NumberOfRandomSamplingPoints,
				layerMin,
				layerMax
			);
		}
		if (randomSample.length === 0) {
			randomSample = getSampleFromInterval(layerMin, layerMax, NumberOfRandomSamplingPoints);
		}

		const intervalList = getIntervalList(
			classificationMethod,
			layerMin,
			layerMax,
			randomSample,
			numberOfClasses
		);
		let scaleColorList = scales.colors(intervalList.length, 'rgb');
		if (isReverse) {
			scaleColorList = scaleColorList.reverse();
		}
		for (let i = 0; i <= numberOfClasses - 1; i++) {
			const row: ColorMapRow = {
				index: i,
				color: [...scaleColorList[i], 1],
				start:
					isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.start
						? colorMapRows[i].start
						: intervalList[i],
				end:
					isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.end
						? colorMapRows[i].end
						: intervalList[i + 1]
			};
			colorMap.push(row);
		}
	}
	return colorMap;
};
