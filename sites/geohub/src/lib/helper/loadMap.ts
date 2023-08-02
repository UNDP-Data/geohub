import { sleep } from '$lib/helper';
import type { Map } from 'maplibre-gl';
import { indicatorProgress } from '$stores';
/**
 * Ensures the Maplibre map object is in sync with the caller
 * @param map Maplibre map
 * @param ms time in miliseconds used to check on the Map, default=100 ms
 * @param wait_ms time in miliseconds to return in case the Map take sot long to return
 * @returns boolean, true is Map is loaded false otherwise
 */

export const loadMap = async (map: Map, ms = 100, wait_ms = 5000) => {
	const startTime: number = Date.now();
	if (map) {
		if (!map.loaded()) {
			indicatorProgress.set(true);
			while (!map.loaded()) {
				await sleep(ms);
				if (Date.now() - startTime > wait_ms) {
					indicatorProgress.set(false);
					return false;
				}
			}
			indicatorProgress.set(false);
		}
		return true;
	} else {
		return false;
	}
};
