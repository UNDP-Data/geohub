import type { VectorApplyToTypes } from '$lib/config/AppConfig';
import { writable, type Writable } from 'svelte/store';

export const APPLY_TO_OPTION_CONTEXT_KEY = 'apply-to-option-store';

export type ApplyToOptionStore = Writable<VectorApplyToTypes>;

export const createApplyToOptionStoreStore = () => {
	return writable(<VectorApplyToTypes>undefined);
};
