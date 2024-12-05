export interface BandMetadata {
	STATISTICS_MAXIMUM?: number;
	STATISTICS_MEAN?: number;
	STATISTICS_MINIMUM: number;
	STATISTICS_STDDEV: number;
	STATISTICS_VALID_PERCENT: number;
	STATISTICS_UNIQUE_VALUES?: { [key: string]: string };
	STATISTICS_MEDIAN?: number;
	Description?: string;
	Source?: string;
	Unit?: string;
}

export interface BandStatistics {
	min: number;
	max: number;
	mean: number;
	count: number;
	sum: number;
	std: number;
	median: number;
	majority: number;
	minority: number;
	unique: number;
	histogram: number[][];
	valid_percent: number;
	masked_pixels: number;
	valid_pixels: number;
	percentile_98: number;
	percentile_2: number;
}

export interface RasterLayerStats {
	[band_no: string]: BandStatistics;
}

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
