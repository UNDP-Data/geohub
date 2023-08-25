<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { SiteInfo } from '$lib/config/AppConfig';
	import type { PageData } from './$types';
	import { fromLocalStorage, isStyleChanged, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import type { StyleSpecification, MapOptions } from 'maplibre-gl';
	import Map from '$components/Map.svelte';

	export let data: PageData;

	let style = data.style;

	$: title = `${style.name} | Map | GeoHub`;
	$: content = style.name;

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

	onMount(() => {
		// if style query param in URL
		if (initiaMapStyleId === style.id) {
			// If style id in local storage is the same with style query param
			// console.log(initiaMapStyle, initialLayerList, initiaMapStyleId, styleInfo.style)
			if (initiaMapStyle && initialLayerList && initialLayerList.length > 0) {
				if (isStyleChanged(initiaMapStyle, style.style)) {
					// restore from local storage
					restoreStyle(initiaMapStyle, initialLayerList);
				} else {
					// restore from database
					restoreStyle(style.style, style.layers);
				}
			} else {
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
	<meta property="og:image" content="/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="/api/og?content={content}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
</svelte:head>

{#if isInitialised}
	<Map bind:mapOptions bind:layerList />
{/if}
