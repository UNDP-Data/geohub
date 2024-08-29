import type { BandMetadata } from './BandMetadata';
import type { RasterLayerStats } from './RasterLayerStats';

export interface RasterTileMetadata {
	band_descriptions?: string[];
	band_metadata?: [string[] | BandMetadata[]];
	bounds?: number[] | string;
	colorinterp?: string[];
	count?: number;
	driver?: string;
	dtype?: string;
	height?: number;
	maxzoom?: number;
	minzoom?: number;
	nodata_type?: string;
	nodata_value?: number;
	overviews?: [];
	width?: number;
	stats?: RasterLayerStats;
	active_band_no?: string;
	isMosaicJson?: boolean;
	scales?: number[];
}
