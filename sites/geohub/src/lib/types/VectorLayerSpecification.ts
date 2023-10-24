import type {
	CircleLayerSpecification,
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
	| CircleLayerSpecification;
