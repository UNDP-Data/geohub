import type { RenderOptions } from '@maplibre/maplibre-gl-native';
import { renderMap, type extensionFormat } from '$lib/server/renderMap';
import type { StyleSpecification } from 'maplibre-gl';

export const renderMapAuto = async (
	width: number,
	height: number,
	ratio: number,
	format: extensionFormat,
	style: StyleSpecification,
	url: URL
) => {
	const center: [number, number] = (style.center as [number, number]) ?? [0, 0];
	const zoom = style.zoom ?? 0;
	const bearing = style.bearing ?? 0;
	const pitch = style.pitch ?? 0;

	const mapOptions: RenderOptions = {
		zoom: zoom,
		width: width,
		height: height,
		center: center,
		bearing: bearing,
		pitch: pitch
	};

	const image = await renderMap(url, style, mapOptions, width, height, ratio, format);

	return image;
};
