import { isEqual } from 'lodash-es';
import type { StyleSpecification } from 'maplibre-gl';

const sortObject = (obj) => {
	if (typeof obj !== 'object' || Array.isArray(obj)) return obj;
	return Object.keys(obj)
		.sort()
		.reduce((result, key) => {
			result[key] = sortObject(obj[key]);
			return result;
		}, {});
};

export const isStyleChanged = (style1: StyleSpecification, style2: StyleSpecification) => {
	if (!style1 || !style2) return false;
	const currentSources = style1.sources;
	const savedSources = style2.sources;
	return !(
		style1.layers.length === style2.layers.length &&
		isEqual(style1.layers, style2.layers) &&
		isEqual(JSON.stringify(sortObject(currentSources)), JSON.stringify(sortObject(savedSources)))
	);
};
