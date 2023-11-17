import { writable, type Writable } from 'svelte/store';

export const NUMBER_OF_CLASSES_CONTEXT_KEY = 'number-of-classes-store';
export const NUMBER_OF_CLASSES_CONTEXT_KEY_2 = 'number-of-classes-store-2';
export const NUMBER_OF_CLASSES_CONTEXT_KEY_LABEL = 'number-of-classes-store-label';

/**
 * Storing number of classes value
 */
export type NumberOfClassesStore = Writable<number>;

export const createNumberOfClassesStore = () => {
	return writable(<number>undefined);
};
