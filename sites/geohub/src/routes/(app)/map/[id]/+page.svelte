<script lang="ts">
	import { page } from '$app/stores';
	import App from '$components/App.svelte';
	import { SiteInfo } from '$lib/config/AppConfig';
	import type { PageData } from './$types';
	import { fromLocalStorage, isStyleChanged, storageKeys, toLocalStorage } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { layerList, map } from '$stores';
	import type { StyleSpecification } from 'maplibre-gl';

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

	$: if ($map) {
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
	}

	const restoreStyle = (newStyle: StyleSpecification, newLayerList: Layer[]) => {
		const style: StyleSpecification = newStyle;
		$map.setStyle(style);

		if (style.center && style.zoom) {
			$map.flyTo({ center: [style.center[0], style.center[1]], zoom: style.zoom });
		}
		if (style.bearing) {
			$map.setBearing(style.bearing);
		}
		if (style.pitch) {
			$map.setPitch(style.pitch);
		}

		if (!$map.isStyleLoaded()) {
			$map.once('styledata', () => {
				$layerList = newLayerList;
			});
		} else {
			$layerList = newLayerList;
		}
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

<App />
