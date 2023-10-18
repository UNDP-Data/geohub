import type { StyleSpecification } from 'maplibre-gl';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';

export const validateStyle = (style: StyleSpecification) => {
	let result = [];
	result = validateStyleMin(style);

	const errors = [];
	for (let i = 0; i < result.length; i++) {
		const msg = result[i].message;
		if (msg) {
			const layerMatch = msg.match(/^layers\[([0-9]+)\]/);
			if (layerMatch) {
				const layerIndex = Number(layerMatch[1]);
				const layerId = style.layers[layerIndex].id;
				errors.push(`Layer "${layerId}": ${msg}`);
			} else {
				errors.push(msg);
			}
		}
	}
	return errors;
};
