<script lang="ts">
	import { onMount } from 'svelte';
	import { Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import StyleSwitcher, { type StyleDefinition } from '$lib';

	let mapContainer: HTMLDivElement;
	let map: Map;

	let styles: StyleDefinition[] = [
		{
			title: 'Carto',
			uri: 'https://undp-data.github.io/style/style.json'
		},
		{
			title: 'Bing Aerial',
			uri: 'https://undp-data.github.io/style/aerialstyle.json'
		}
	];

	onMount(async () => {
		map = new Map({
			container: mapContainer,
			style: styles[0].uri
		});

		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(new ScaleControl({}), 'bottom-left');
	});
</script>

<div class="map" bind:this={mapContainer} />
<StyleSwitcher bind:map {styles} position="bottom-left" />

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
