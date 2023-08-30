<script lang="ts">
	import CurrentLocation from '@undp-data/current-location';
	import StyleSwicher, { type StyleDefinition } from '@undp-data/style-switcher';
	import {
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl
	} from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { map } from '../stores';

	export let styles: StyleDefinition[];
	let mapContainer: HTMLDivElement;
	let newMap: Map;

	onMount(async () => {
		newMap = new Map({
			container: mapContainer,
			style: styles[0].uri,
			center: [0, 0],
			zoom: 2.5,
			hash: true,
			attributionControl: false
		});

		newMap.addControl(new NavigationControl({}), 'top-right');
		newMap.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'top-right'
		);
		newMap.addControl(new ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');
		newMap.addControl(new AttributionControl({ compact: true }), 'bottom-right');
		newMap.getCanvas().style.cursor = 'pointer';

		newMap.on('load', () => {
			newMap.resize();
		});

		map.update(() => newMap);
	});
</script>

<div class="map" id="map" bind:this={mapContainer} />
<CurrentLocation bind:map={$map} isHover={true} position="top-left" />
<StyleSwicher bind:map={$map} {styles} position="bottom-left" />

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

	:global(.maplibregl-ctrl-bottom-right) {
		padding-left: 80px;
	}
</style>
