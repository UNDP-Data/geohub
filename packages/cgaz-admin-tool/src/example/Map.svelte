<script lang="ts">
	import maplibregl, { Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { MaplibreCgazAdminControl } from '$lib';
	import * as pmtiles from 'pmtiles';
	import '$lib/AdminControl.css';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	let mapContainer: HTMLDivElement;
	let map: Map;

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: 'https://unpkg.com/@undp-data/style@1.1.0/dist/style.json',
			hash: true
		});

		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(new ScaleControl({}), 'bottom-left');

		map.addControl(new MaplibreCgazAdminControl(), 'top-left');
	});
</script>

<div class="map" bind:this={mapContainer} />

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
</style>
