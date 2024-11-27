import {
	Map,
	RasterTileSource,
	VectorTileSource,
	type CircleLayerSpecification,
	type FillExtrusionLayerSpecification,
	type FillLayerSpecification,
	type HeatmapLayerSpecification,
	type LineLayerSpecification,
	type RasterLayerSpecification,
	type SymbolLayerSpecification
} from 'maplibre-gl';

export const getLayerSourceUrl = (map: Map, layerId: string) => {
	const style = map.getStyle();
	const layerStyle = style?.layers?.find((l) => l.id === layerId) as
		| RasterLayerSpecification
		| FillLayerSpecification
		| SymbolLayerSpecification
		| CircleLayerSpecification
		| HeatmapLayerSpecification
		| LineLayerSpecification
		| FillExtrusionLayerSpecification;
	const source = map.getSource(layerStyle.source) as RasterTileSource | VectorTileSource;
	if (source?.tiles) {
		// pbf
		return source.tiles[0];
	} else {
		// tilejson
		return source?.url;
	}
};
