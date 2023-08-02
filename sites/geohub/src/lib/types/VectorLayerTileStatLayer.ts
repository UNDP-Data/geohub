import type { VectorLayerTileStatAttribute } from './VectorLayerTileStatAttribute';

export interface VectorLayerTileStatLayer {
	layer: string;
	geometry: string;
	count: number;
	attributeCount: number;
	attributes: VectorLayerTileStatAttribute[];
}
