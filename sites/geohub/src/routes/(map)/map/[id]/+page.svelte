<script lang="ts">
	import { page } from '$app/stores';
	import Map from '$components/Map.svelte';
	import { SiteInfo } from '$lib/config/AppConfig';
	import { fromLocalStorage, isStyleChanged, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import type { MapOptions, StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

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
					restoreStyle(initiaMapStyle, initialLayerList);
				} else {
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
