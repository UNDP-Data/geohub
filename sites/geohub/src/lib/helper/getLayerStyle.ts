import type {
	FillLayerSpecification,
	HeatmapLayerSpecification,
	LineLayerSpecification,
	Map,
	RasterLayerSpecification,
	SymbolLayerSpecification
} from 'maplibre-gl';

export const getLayerStyle = (
	map: Map,
	layerId: string
):
	| RasterLayerSpecification
	| SymbolLayerSpecification
	| HeatmapLayerSpecification
	| FillLayerSpecification
	| LineLayerSpecification => {
	const style = map.getStyle();
	const layer = style.layers.find((l) => l.id === layerId);
	return layer as
		| RasterLayerSpecification
		| SymbolLayerSpecification
		| HeatmapLayerSpecification
		| FillLayerSpecification
		| LineLayerSpecification;
};
