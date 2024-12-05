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
