import type { VectorLayerSpecification } from '$lib/types';
import type { HillshadeLayerSpecification, Map, RasterLayerSpecification } from 'maplibre-gl';

export const getLayerStyle = (
	map: Map,
	layerId: string
): RasterLayerSpecification | VectorLayerSpecification | HillshadeLayerSpecification => {
	const style = map.getStyle();
	const layer = style?.layers?.find((l) => l.id === layerId);
	return layer as RasterLayerSpecification | VectorLayerSpecification;
};
