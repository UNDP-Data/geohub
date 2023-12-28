<script lang="ts">
	import CurrentLocation from '$lib';
	import { Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let mapContainer: HTMLDivElement;
	let map: Map;

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: 'https://unpkg.com/@undp-data/style@1.0.1/dist/style.json',
			hash: true
		});

		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(new ScaleControl({}), 'bottom-left');
	});
</script>

<sveltekit:head>
	<title>UNDP Current location example</title>
</sveltekit:head>

<div class="map" bind:this={mapContainer} />
<CurrentLocation bind:map isHover={true} position="top-left" />

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
