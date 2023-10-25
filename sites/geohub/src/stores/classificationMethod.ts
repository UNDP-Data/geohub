import type { ClassificationMethodTypes } from '$lib/config/AppConfig';
import { writable, type Writable } from 'svelte/store';

export const CLASSIFICATION_METHOD_CONTEXT_KEY = 'classification-method-store';

/**
 * Storing classification method
 */
export type ClassificationMethodStore = Writable<ClassificationMethodTypes>;

export const createClassificationMethodStore = () => {
	return writable(<ClassificationMethodTypes>undefined);
};
