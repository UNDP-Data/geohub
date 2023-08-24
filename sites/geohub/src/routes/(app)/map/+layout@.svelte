<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import * as pmtiles from 'pmtiles';
	import maplibregl from 'maplibre-gl';
	import Header from '$components/Header.svelte';
	import { fromLocalStorage, storageKeys, toLocalStorage } from '$lib/helper';
	import { layerList, map } from '$stores';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Layer } from '$lib/types';

	let headerHeight: number;

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	const layerListStorageKey = storageKeys.layerList($page.url.host);
	const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
	const initialLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, null);

	beforeNavigate(() => {
		if (!$map) return;
		const storageLayerList = $layerList;
		toLocalStorage(layerListStorageKey, storageLayerList);

		let storageMapStyle = $map?.getStyle();
		storageMapStyle.center = [$map.getCenter().lng, $map.getCenter().lat];
		storageMapStyle.zoom = $map.getZoom();
		toLocalStorage(mapStyleStorageKey, storageMapStyle);
	});

	$: if ($map) {
		layerList.subscribe((value) => {
			const storageValue = value
				? value
				: initialLayerList && initialLayerList.length > 0
				? initialLayerList
				: null;
			toLocalStorage(layerListStorageKey, storageValue);
		});

		map.subscribe((value) => {
			let storageValue = value ? value.getStyle() : null;
			toLocalStorage(mapStyleStorageKey, storageValue);
		});
		$map?.on('styledata', async () => {
			let storageValue = $map.getStyle();
			toLocalStorage(mapStyleStorageKey, storageValue);
		});
	}
</script>

<svelte:head>
	<style type="text/css">
		html,
		body {
			margin: 0;
			padding: 0;
			min-height: 100vh;
			/* mobile viewport bug fix */
			min-height: -webkit-fill-available;
			font-family: ProximaNova, sans-serif;
			font-size: 13px;
		}

		html {
			overflow-y: hidden !important;
			height: -webkit-fill-available;
		}
	</style>
</svelte:head>

<Header bind:headerHeight />

<div style="margin-top: {headerHeight}px">
	<slot />
</div>

<SvelteToast />

<style global lang="scss">
	@import '@undp-data/undp-bulma/bulma.scss';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import '/node_modules/flag-icons/css/flag-icons.min.css';
</style>
