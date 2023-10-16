<script lang="ts">
	import StyleSwitcher, { type StyleDefinition } from '$lib';
	import { Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import { onMount } from 'svelte';

	let mapContainer: HTMLDivElement;
	let map: Map;

	let styles: StyleDefinition[] = [
		{
			title: 'Carto',
			uri: 'https://unpkg.com/@undp-data/style@latest/dist/style.json'
		},
		{
			title: 'Bing Aerial',
			uri: 'https://unpkg.com/@undp-data/style@latest/dist/aerialstyle.json'
		}
	];

	let defaultStyle = styles[1].title;

	onMount(async () => {
		const style = styles.find((s) => s.title === defaultStyle) as StyleDefinition;
		map = new Map({
			container: mapContainer,
			style: style.uri
		});

		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(new ScaleControl({}), 'bottom-left');
	});
</script>

<div class="map" bind:this={mapContainer} />
<StyleSwitcher bind:map {styles} position="bottom-left" bind:defaultStyle />

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
