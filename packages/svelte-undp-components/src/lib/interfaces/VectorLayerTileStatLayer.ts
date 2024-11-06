import type { VectorLayerTileStatAttribute } from './VectorLayerTileStatAttribute.js';

export interface VectorLayerTileStatLayer {
	layer: string;
	geometry: string;
	count: number;
	attributeCount: number;
	attributes: VectorLayerTileStatAttribute[];
}
