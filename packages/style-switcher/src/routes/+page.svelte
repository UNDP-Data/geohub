<script lang="ts">
	import MaplibreStyleSwitcherControl, { type StyleDefinition } from '$lib';
	import '$lib/maplibre-style-switcher.css';
	import { Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount } from 'svelte';

	let mapContainer: HTMLDivElement | undefined = $state();
	let map: Map;

	let styles: StyleDefinition[] = [
		{
			title: 'Carto',
			uri: 'https://dev.undpgeohub.org/api/mapstyle/style.json',
			image:
				'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://dev.undpgeohub.org/api/mapstyle/style.json&ratio=2'
		},
		{
			title: 'Positron',
			uri: 'https://dev.undpgeohub.org/api/mapstyle/positron.json',
			image:
				'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://dev.undpgeohub.org/api/mapstyle/positron.json&ratio=2'
		},
		{
			title: 'Dark',
			uri: 'https://dev.undpgeohub.org/api/mapstyle/dark.json',
			image:
				'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://dev.undpgeohub.org/api/mapstyle/dark.json&ratio=2'
		},
		{
			title: 'Bing Aerial',
			uri: 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json',
			image:
				'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json&ratio=2'
		},
		{
			title: 'Maplibre style',
			uri: 'https://demotiles.maplibre.org/style.json',
			image:
				'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://demotiles.maplibre.org/style.json&ratio=2'
		},
		{
			title: 'Blank',
			uri: 'https://dev.undpgeohub.org/api/mapstyle/blank.json',
			image:
				'https://staticimage.undpgeohub.org/api/style/static/36.975,-1.364,1,0,0/60x60.webp?url=https://dev.undpgeohub.org/api/mapstyle/blank.json&ratio=2'
		}
	];

	let defaultStyle = styles[0].title;

	let styleSwitcherControl: MaplibreStyleSwitcherControl;

	onMount(() => {
		if (!mapContainer) return;
		const style = styles.find((s) => s.title === defaultStyle) as StyleDefinition;
		map = new Map({
			container: mapContainer,
			style: style.uri
		});

		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(new ScaleControl({}), 'bottom-left');

		styleSwitcherControl = new MaplibreStyleSwitcherControl(styles);
		map.addControl(styleSwitcherControl, 'bottom-left');

		map.once('styledata', () => {
			styleSwitcherControl.initialise();
		});
	});
</script>

<sveltekit:head>
	<title>UNDP Style Switcher example</title>
</sveltekit:head>

<div class="map" bind:this={mapContainer}></div>

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
