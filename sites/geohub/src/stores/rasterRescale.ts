import { writable, type Writable } from 'svelte/store';

export const RASTERRESCALE_CONTEXT_KEY = 'maplibre-raster-rescale-store';

/**
 * Storing min and max value for raster rescaling
 */
export type RasterRescaleStore = Writable<number[]>;

export const createRasterRescaleStore = () => {
	return writable(<number[]>undefined);
};
