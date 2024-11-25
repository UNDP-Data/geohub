import { ClassificationMethodTypes } from '$lib/constants/ClassificationMethod.js';
import chroma from 'chroma-js';
import { jenks } from 'simple-statistics';
import { isInt } from './isInt.js';
import { remapInputValue } from './remapInputValue.js';

export const getIntervalList = (
	classificationMethod: ClassificationMethodTypes,
	layerMin: number,
	layerMax: number,
	randomSample: number[],
	numberOfClasses: number
) => {
	let isInteger = true;
	if (layerMin === 0 && layerMax === 1) {
		// if o to 1, should allow float values
		isInteger = false;
	} else if (isInt(layerMin) && isInt(layerMax)) {
		// if layer min and max are integer, assume all values are integer
		isInteger = true;
	} else {
		// if all sample values are integer, it returns integer values instead of float values
		for (const n of randomSample) {
			isInteger = isInt(n);
			if (!isInteger) {
				break;
			}
		}
	}

	let intervalList: number[];
	if (classificationMethod === ClassificationMethodTypes.NATURAL_BREAK) {
		if (layerMin === layerMax) {
			return [layerMin, layerMax];
		} else {
			intervalList = jenks(randomSample, numberOfClasses)?.map((element) => {
				return isInteger ? Math.round(element) : Number(element.toFixed(2));
			});
			if (
				intervalList.length > 2 &&
				intervalList[intervalList.length - 1] === intervalList[intervalList.length - 2]
			) {
				// set layerMax to the last value of array if the last two values are same
				if (intervalList[intervalList.length - 1] === layerMax) {
					intervalList[intervalList.length - 1] = layerMax + 1;
				} else {
					intervalList[intervalList.length - 1] = layerMax;
				}
			}
			if (intervalList) {
				if (intervalList[0] > layerMin) {
					intervalList[0] = layerMin;
				}
				if (intervalList[intervalList.length - 1] < layerMax) {
					intervalList[intervalList.length - 1] = layerMax;
				}
			} else {
				intervalList = [layerMin, layerMax];
			}
		}
	} else if (
		(classificationMethod === ClassificationMethodTypes.LOGARITHMIC && layerMin < 1) ||
		layerMax < 1
	) {
		const range = layerMax - layerMin;
		const positive = [layerMin, ...randomSample, layerMax].map((v) => {
			return remapInputValue(v, layerMin, layerMax, 1, 1 + range);
		});
		intervalList = chroma
			.limits(positive, classificationMethod, numberOfClasses)
			.map((v) => {
				return remapInputValue(v, 1, 1 + range, layerMin, layerMax);
			})
			.map((element) => {
				return isInteger ? Math.round(element) : Number(element.toFixed(2));
			});
	} else {
		intervalList = chroma
			.limits([layerMin, ...randomSample, layerMax], classificationMethod, numberOfClasses)
			.map((element) => {
				return isInteger ? Math.round(element) : Number(element.toFixed(2));
			});
	}
	return intervalList;
};
