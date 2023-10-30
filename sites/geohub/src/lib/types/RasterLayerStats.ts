import type { BandStatistics } from './BandStatistics';

export interface RasterLayerStats {
	[band_no: string]: BandStatistics;
}
