import type { ClassificationMethodTypes } from '$lib/config/AppConfig';
import { writable, type Writable } from 'svelte/store';

// for color classify component
export const CLASSIFICATION_METHOD_CONTEXT_KEY = 'classification-method-store';
// for valeu classify component (icon size, line width, etc)
export const CLASSIFICATION_METHOD_CONTEXT_KEY_2 = 'classification-method-store-2';
// for label classify component
export const CLASSIFICATION_METHOD_CONTEXT_KEY_LABEL = 'classification-method-store-label';

/**
 * Storing classification method
 */
export type ClassificationMethodStore = Writable<ClassificationMethodTypes>;

export const createClassificationMethodStore = () => {
	return writable(<ClassificationMethodTypes>undefined);
};
