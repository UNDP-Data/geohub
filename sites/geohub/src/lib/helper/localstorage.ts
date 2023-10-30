import { browser } from '$app/environment';

export const storageKeys = {
	layerList: (suffix: string) => `layer-list-${suffix}`,
	mapStyle: (suffix: string) => `map-style-${suffix}`,
	mapStyleId: (suffix: string) => `map-style-id-${suffix}`
};

export const toLocalStorage = (storageKey: string, value: unknown) => {
	if (browser) {
		// console.log(typeof value);
		const storageValue = typeof value === 'object' ? JSON.stringify(value) : value;
		window.localStorage.setItem(
			storageKey,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			storageValue
		);
	}
};

export const fromLocalStorage = (storageKey: string, fallbackValue: unknown) => {
	if (browser) {
		const storedValue = window.localStorage.getItem(storageKey);
		if (
			storedValue !== undefined &&
			storedValue !== null &&
			storedValue !== 'undefined' &&
			storedValue !== 'null'
		) {
			return typeof fallbackValue === 'object' ? JSON.parse(storedValue) : storedValue;
		}
	}
	return fallbackValue;
};
