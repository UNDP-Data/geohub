<script lang="ts">
	import { page } from '$app/stores';
	import Map from '$components/Map.svelte';
	import { SiteInfo } from '$lib/config/AppConfig';
	import { fromLocalStorage, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import type { MapOptions, StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: title = 'Map | GeoHub';
	$: content = 'Map';

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

	let layerList: Layer[] = [];

	let isInitialised = false;

	onMount(() => {
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
					restoreStyle(initiaMapStyle, initialLayerList);
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

		layerList = newLayerList;
	};
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={SiteInfo.site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={SiteInfo.site_description} />
	<meta property="og:description" content={SiteInfo.site_description} />
	<meta name="twitter:description" content={SiteInfo.site_description} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="{$page.url.origin}/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="{$page.url.origin}/api/og?content={content}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
</svelte:head>

{#if isInitialised}
	<Map bind:mapOptions bind:layerList bind:defaultStyle={data.config.DefaultMapStyle} />
{/if}
