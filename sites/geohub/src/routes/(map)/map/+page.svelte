<script lang="ts">
	import { page } from '$app/stores';
	import Map from '$components/pages/map/Map.svelte';
	import { fromLocalStorage, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { LAYERLIST_STORE_CONTEXT_KEY, type LayerListStore } from '$stores';
	import type { MapOptions, StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import type { PageData } from './$types';

	const layerList: LayerListStore = getContext(LAYERLIST_STORE_CONTEXT_KEY);

	export let data: PageData;

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	const initialLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, null);
	const initiaMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, null);

	let mapOptions: MapOptions = {
		container: undefined,
		style: data.defaultStyle,
		center: [0, 0],
		zoom: 3,
		hash: true,
		attributionControl: false
	};

	let isInitialised = false;

	onMount(async () => {
		// no style query param
		if (mapStyleIdStorageKey) {
			toLocalStorage(mapStyleIdStorageKey, null);
		}
		if (initiaMapStyle && initialLayerList && initialLayerList.length > 0) {
			let existAllLayers = true;
			initialLayerList.forEach((l) => {
				if (!initiaMapStyle.layers.find((ml) => ml.id === l.id)) {
					existAllLayers = false;
				}
			});
			if (existAllLayers) {
				// restore from local storage

				// to make sure dataset links exist, otherwise remove all local storage
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
						const stacType = l.dataset.properties.tags.find((t) => t.key === 'stacType')?.value;
						if (['cog', 'mosaicjson'].includes(stacType)) continue;
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
					toLocalStorage(layerListStorageKey, []);
					toLocalStorage(mapStyleStorageKey, data.defaultStyle);
				}
			} else {
				toLocalStorage(layerListStorageKey, []);
				toLocalStorage(mapStyleStorageKey, data.defaultStyle);
			}
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

		$layerList = newLayerList;
	};
</script>

{#if isInitialised}
	<Map bind:mapOptions bind:defaultStyle={data.config.DefaultMapStyle} />
{/if}
