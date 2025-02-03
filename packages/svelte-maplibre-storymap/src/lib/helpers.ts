import { Map } from 'maplibre-gl';
import type { StoryMapChapterLayerEvent } from './interfaces/StoryMapChapter';

export const layerTypes = {
	fill: ['fill-opacity'],
	line: ['line-opacity'],
	circle: ['circle-opacity', 'circle-stroke-opacity'],
	symbol: ['icon-opacity', 'text-opacity'],
	raster: ['raster-opacity'],
	'fill-extrusion': ['fill-extrusion-opacity'],
	heatmap: ['heatmap-opacity']
};

const getLayerPaintType = (map: Map, layer: string) => {
	const layerType = map.getLayer(layer)?.type;
	if (!layerType) return undefined;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return layerTypes[layerType];
};

export const setLayerOpacity = (map: Map, layer: StoryMapChapterLayerEvent) => {
	const paintProps = getLayerPaintType(map, layer.layer);
	if (paintProps?.length > 0) {
		paintProps.forEach(function (prop: string) {
			let options = {};
			if (layer.duration) {
				const transitionProp = prop + '-transition';
				options = { duration: layer.duration };
				map.setPaintProperty(layer.layer, transitionProp, options);
			}
			map.setPaintProperty(layer.layer, prop, layer.opacity, options);

			const style = map.getStyle();
			const l = style?.layers?.find((l) => l.id === layer?.layer);
			if (l) {
				if (!l.paint) {
					l.paint = {};
				}
				l.paint[prop] = layer.opacity;
				map.setStyle(style);
			}
		});
	} else {
		const visibility = layer.opacity === 0 ? 'none' : 'visible';
		map.setLayoutProperty(layer.layer, 'visibility', visibility);

		const style = map.getStyle();
		const l = style?.layers?.find((l) => l.id === layer?.layer);
		if (l) {
			if (!l.layout) {
				l.layout = {};
			}
			l.layout.visibility = visibility;
			map.setStyle(style);
		}
	}
};
