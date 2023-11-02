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
