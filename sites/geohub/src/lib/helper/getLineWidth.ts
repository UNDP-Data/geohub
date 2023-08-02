import type { Map } from 'maplibre-gl';

export const getLineWidth = (map: Map, layerId: string, defaultWidth = 1) => {
	let value = map.getPaintProperty(layerId, 'line-width');
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	if (!value || (value && value.type === 'interval')) {
		value = defaultWidth;
	}
	return Number(value);
};
