import type { VectorLayerSpecification } from '$lib/types';
import type { Map, RasterLayerSpecification } from 'maplibre-gl';

export const getLayerStyle = (
	map: Map,
	layerId: string
): RasterLayerSpecification | VectorLayerSpecification => {
	const style = map.getStyle();
	const layer = style.layers.find((l) => l.id === layerId);
	return layer as RasterLayerSpecification | VectorLayerSpecification;
};
