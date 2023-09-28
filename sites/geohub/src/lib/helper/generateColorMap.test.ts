import { describe, it, expect } from 'vitest';
import { generateColorMap } from './generateColorMap';
import { ClassificationMethodTypes } from '$lib/config/AppConfig';

describe('generateColorMap', () => {
	it('should generate a color map with equidistant classification method', () => {
		const layerMin = 0;
		const layerMax = 10;
		const colorMapRows = [];
		const numberOfClasses = 3;
		const classificationMethod = ClassificationMethodTypes.EQUIDISTANT;
		const isClassificationMethodEdited = false;
		const percentile98 = 9;
		const colorMapName = 'RdYlBu';

		const colorMap = generateColorMap(
			layerMin,
			layerMax,
			colorMapRows,
			numberOfClasses,
			classificationMethod,
			isClassificationMethodEdited,
			percentile98,
			colorMapName
		);

		expect(colorMap.length).toEqual(numberOfClasses);
		expect(colorMap[0].index).toEqual(0);
		expect(colorMap[0].start).toEqual(layerMin);
		expect(colorMap[0].end).toEqual(3);
		expect(colorMap[1].index).toEqual(1);
		expect(colorMap[1].start).toEqual(3);
		expect(colorMap[1].end).toEqual(7);
		expect(colorMap[2].index).toEqual(2);
		expect(colorMap[2].start).toEqual(7);
		expect(colorMap[2].end).toEqual(layerMax);
	});
});
