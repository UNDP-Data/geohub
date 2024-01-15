import type { ClassificationMethodTypes } from '$lib/config/AppConfig';
import type { RasterLayerSpecification, SourceSpecification } from 'maplibre-gl';
import type { VectorLayerSpecification } from './VectorLayerSpecification';
import type { RasterTileMetadata } from './RasterTileMetadata';
import type { VectorTileMetadata } from './VectorTileMetadata';

export interface DatasetDefaultLayerStyle {
	dataset_id: string;
	layer_id: string;
	layer_type: 'raster' | 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap' | 'fill-extrusion';
	source: SourceSpecification;
	style: RasterLayerSpecification | VectorLayerSpecification;
	colormap_name?: string;
	classification_method?: ClassificationMethodTypes;
	classification_method_2?: ClassificationMethodTypes;
	metadata?: RasterTileMetadata | VectorTileMetadata;
	created_user?: string;
	createdat?: string;
	updated_user?: string;
	updatedat?: string;
}
