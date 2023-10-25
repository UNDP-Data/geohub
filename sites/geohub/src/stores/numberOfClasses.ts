import { writable, type Writable } from 'svelte/store';

export const NUMBER_OF_CLASSES_CONTEXT_KEY = 'number-of-classes-store';

/**
 * Storing min and max value for raster rescaling
 */
export type NumberOfClassesStore = Writable<number>;

export const createNumberOfClassesStore = () => {
	return writable(<number>undefined);
};
