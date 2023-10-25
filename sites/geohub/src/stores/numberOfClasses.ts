import { writable, type Writable } from 'svelte/store';

export const NUMBER_OF_CLASSES_CONTEXT_KEY = 'number-of-classes-store';

/**
 * Storing number of classes value
 */
export type NumberOfClassesStore = Writable<number>;

export const createNumberOfClassesStore = () => {
	return writable(<number>undefined);
};
