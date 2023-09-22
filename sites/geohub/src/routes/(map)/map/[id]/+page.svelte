<script lang="ts">
	import { page } from '$app/stores';
	import Map from '$components/Map.svelte';
	import { fromLocalStorage, isStyleChanged, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import type { MapOptions, StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let style = data.style;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	const initialLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, null);
	const initiaMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, null);
	const initiaMapStyleId: string = fromLocalStorage(mapStyleIdStorageKey, null)?.toString();

	let mapOptions: MapOptions = {
		container: undefined,
		style: data.defaultStyle,
		center: [0, 0],
		zoom: 3,
		hash: true,
		attributionControl: false
	};

	let layerList: Layer[] = [];

	let isInitialised = false;

	onMount(async () => {
		// console.log(initiaMapStyleId, initiaMapStyle, style)
		// if style query param in URL
		if (`${initiaMapStyleId}` === `${style.id}`) {
			// If style id in local storage is the same with style query param
			if (isStyleChanged(initiaMapStyle, style.style)) {
				// restore from local storage

				// to make sure dataset links exist, otherwise restore from database
				let linksNotExist = true;
				initialLayerList.forEach((l) => {
					if (l.dataset.properties.links) {
						linksNotExist = false;
					}
				});
				if (!linksNotExist) {
					const nonExistLayers: Layer[] = [];
					for (const l of initialLayerList) {
						const id = l.dataset.properties.id;
						const datasetUrl = `${$page.url.origin}/api/datasets/${id}`;
						const res = await fetch(datasetUrl);
						if (res.ok) {
							l.dataset = await res.json();
						} else {
							nonExistLayers.push(l);
						}
					}
					// only accept if dataset metadata is fetched
					if (nonExistLayers.length > 0) {
						nonExistLayers.forEach((layer) => {
							initialLayerList.splice(initialLayerList.findIndex((l) => l.id === layer.id));
							initiaMapStyle.layers.splice(
								initiaMapStyle.layers.findIndex((l) => l.id === layer.id)
							);
						});
					}
					restoreStyle(initiaMapStyle, initialLayerList);
					toLocalStorage(mapStyleStorageKey, initiaMapStyle);
					toLocalStorage(layerListStorageKey, initialLayerList);
				} else {
					restoreStyle(style.style, style.layers);
				}
			} else {
				initialLayerList?.forEach((l) => {
					const l2 = style.layers.find((x) => x.id === l.id);
					if (l2?.activeTab !== l.activeTab) {
						l2.activeTab = l.activeTab;
					}
				});

				// restore from database
				restoreStyle(style.style, style.layers);
			}
		} else {
			// style ID is different from query param
			restoreStyle(style.style, style.layers);
			toLocalStorage(mapStyleIdStorageKey, style.id);
		}

		isInitialised = true;
	});

	const restoreStyle = (newStyle: StyleSpecification, newLayerList: Layer[]) => {
		mapOptions.style = newStyle;

		if (newStyle.center) {
			mapOptions.center = [newStyle.center[0], newStyle.center[1]];
		}
		if (newStyle.zoom) {
			mapOptions.zoom = newStyle.zoom;
		}

		if (newStyle.bearing) {
			mapOptions.bearing = newStyle.bearing;
		}

		if (newStyle.pitch) {
			mapOptions.pitch = newStyle.pitch;
		}

		layerList = newLayerList;
	};
</script>

{#if isInitialised}
	<Map bind:mapOptions bind:layerList bind:defaultStyle={data.config.DefaultMapStyle} />
{/if}
