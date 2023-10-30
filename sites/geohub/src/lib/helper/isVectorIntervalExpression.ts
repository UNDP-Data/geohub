import type { Map } from 'maplibre-gl';

export const isVectorIntervalExpression = (
	map: Map,
	layerId: string,
	property: 'line-color' | 'line-width' | 'icon-color' | 'icon-size' | 'fill-color'
) => {
	const layoutProperties = ['icon-size'];
	const expr = layoutProperties.includes(property)
		? map.getLayoutProperty(layerId, property)
		: map.getPaintProperty(layerId, property);
	return expr?.type === 'interval' || expr?.type === 'categorical';
};
