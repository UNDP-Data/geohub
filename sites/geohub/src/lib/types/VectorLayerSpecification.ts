import type {
	CircleLayerSpecification,
	FillExtrusionLayerSpecification,
	FillLayerSpecification,
	HeatmapLayerSpecification,
	LineLayerSpecification,
	SymbolLayerSpecification
} from 'maplibre-gl';

export type VectorLayerSpecification =
	| FillLayerSpecification
	| LineLayerSpecification
	| SymbolLayerSpecification
	| HeatmapLayerSpecification
	| CircleLayerSpecification
	| FillExtrusionLayerSpecification;

export const VectorLayerTypeValues = [
	'fill',
	'symbol',
	'line',
	'circle',
	'heatmap',
	'fill-extrusion'
] as const;

export type VectorLayerTypes = (typeof VectorLayerTypeValues)[number];
