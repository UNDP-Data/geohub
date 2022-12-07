<script lang="ts">
	import { onMount } from 'svelte';
	import { Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import CurrentLocation from '$lib';
	import { PUBLIC_AZURE_URL } from '$env/static/public';

	let mapContainer: HTMLDivElement;
	let map: Map;

	onMount(async () => {
		map = new Map({
			container: mapContainer,
			style: 'https://undp-data.github.io/style/style.json'
		});

		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(new ScaleControl({}), 'bottom-left');
	});
</script>

<div class="map" bind:this={mapContainer} />
<CurrentLocation bind:map azureBaseUrl={PUBLIC_AZURE_URL} isHover={true} position="top-left" />

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
