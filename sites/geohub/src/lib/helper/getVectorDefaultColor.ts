import chroma from 'chroma-js';
import type { Map } from 'maplibre-gl';

export const getVectorDefaultColor = (
	map: Map,
	layerId: string,
	property: 'icon-color' | 'fill-color' | 'fill-outline-color' | 'line-color' | 'circle-color',
	defaultColor?: string
): string => {
	if (!map.getLayer(layerId)) return;
	let color = map.getPaintProperty(layerId, property);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	if (!color || (color && (color.type === 'interval' || (color && color.type === 'categorical')))) {
		if (property === 'fill-outline-color') {
			color = chroma(defaultColor).darken(2.5).hex();
		} else {
			color = chroma.random().hex();
		}
	}
	return color as string;
};
