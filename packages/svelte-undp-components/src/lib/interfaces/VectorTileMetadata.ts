import type { VectorLayerMetadata } from './VectorLayerMetadata.js';
import type { VectorLayerTileStatLayer } from './VectorLayerTileStatLayer.js';

// https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md
export interface VectorTileMetadata {
	name: string;
	format: 'pbf';
	bounds: string;
	center: string;
	minzoom: number;
	maxzoom: number;
	attribution?: string;
	description?: string;
	type?: string;
	version?: string;
	json?: {
		vector_layers: VectorLayerMetadata[];
		tilestats?: {
			layerCount: number;
			layers: VectorLayerTileStatLayer[];
		};
	};
}
