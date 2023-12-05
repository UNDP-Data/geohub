import { writable, type Writable } from 'svelte/store';

export const LEGEND_READONLY_CONTEXT_KEY = 'legend-readonly-store';

/**
 * Storing state of readonly for legend components
 */
export type LegendReadonlyStore = Writable<boolean>;

export const createLegendReadonlyStore = () => {
	return writable(<boolean>false);
};
