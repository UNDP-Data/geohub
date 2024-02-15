<script lang="ts">
	import MaplibreCgazAdminControl from '$lib';
	import '$lib/maplibre-cgaz-admin-control.css';
	import { Map, NavigationControl, ScaleControl, addProtocol } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';

	let mapContainer: HTMLDivElement;
	let map: Map;

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);

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

<sveltekit:head>
	<title>UNDP CGAZ Admin Tool</title>
</sveltekit:head>

<div class="map" bind:this={mapContainer} />

<style>
	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
</style>
