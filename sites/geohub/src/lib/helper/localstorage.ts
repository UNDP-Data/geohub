import { browser } from '$app/environment';
import { MapStyles } from '$lib/config/AppConfig';
import type { Layer } from '$lib/types';
import type { StyleSpecification } from 'maplibre-gl';

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

/**
 * Add new data to local storage
 * @param pageUrl URL object of current page. should be $page.url object
 * @param callback callback function to add additional data to local storage
 * @param reset if true, reset local storage before adding data. Default is True
 * @returns returns URL string to be redirected to map edit page
 */
export const addDataToLocalStorage = async (
	pageUrl: URL,
	callback: (
		layers: Layer[],
		style: StyleSpecification,
		styleId: string
	) => { layers: Layer[]; style: StyleSpecification; styleId: string },
	reset = true
) => {
	const layerListStorageKey = storageKeys.layerList(pageUrl.host);
	const mapStyleStorageKey = storageKeys.mapStyle(pageUrl.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId(pageUrl.host);

	let storageLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, []);
	let storageMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, {});
	let storageMapStyleId: string | undefined = fromLocalStorage(mapStyleIdStorageKey, undefined);

	if (reset) {
		// if style ID is in localstorage, reset layerList and mapStyle to add a dataset to blank map.
		storageLayerList = null;
		storageMapStyle = null;
		storageMapStyleId = null;
	}

	// initialise local storage if they are NULL.
	if (!(storageMapStyle && Object.keys(storageMapStyle).length > 0)) {
		const res = await fetch(MapStyles[0].uri);
		const baseStyle = await res.json();
		storageMapStyle = baseStyle;
	}
	if (!storageLayerList) {
		storageLayerList = [];
	}

	const res = callback(storageLayerList, storageMapStyle, storageMapStyleId);
	storageLayerList = res.layers;
	storageMapStyle = res.style;
	storageMapStyleId = res.styleId;

	// save layer info to localstorage
	toLocalStorage(mapStyleIdStorageKey, storageMapStyleId);
	toLocalStorage(mapStyleStorageKey, storageMapStyle);
	toLocalStorage(layerListStorageKey, storageLayerList);

	return {
		url: '/maps/edit'
	};
};
