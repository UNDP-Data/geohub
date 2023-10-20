import type { ClassificationMethodTypes } from '$lib/config/AppConfig';
import type {
	CircleLayerSpecification,
	FillLayerSpecification,
	HeatmapLayerSpecification,
	LineLayerSpecification,
	RasterLayerSpecification,
	SourceSpecification,
	SymbolLayerSpecification
} from 'maplibre-gl';

export interface DatasetDefaultLayerStyle {
	dataset_id: string;
	layer_id: string;
	layer_type: 'raster' | 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap';
	source: SourceSpecification;
	style:
		| RasterLayerSpecification
		| FillLayerSpecification
		| LineLayerSpecification
		| SymbolLayerSpecification
		| CircleLayerSpecification
		| HeatmapLayerSpecification;
	colormap_name?: string;
	classification_method?: ClassificationMethodTypes;
	created_user: string;
	createdat: string;
	updated_user?: string;
	updatedat?: string;
}
