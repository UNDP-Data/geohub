<script lang="ts">
	import { page } from '$app/stores';
	import CurrentLocation from '@undp-data/current-location';
	import { MaplibreLegendControl } from '@watergis/maplibre-gl-legend';
	import AttributePopupControl from '@watergis/svelte-maplibre-attribute-popup';
	import { MapExportControl } from '@watergis/svelte-maplibre-export';
	import maplibregl, {
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl
	} from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	let map: Map;
	let mapContainer: HTMLDivElement;
	let isMapLoaded = false;

	onMount(async () => {
		map = new Map({
			container: mapContainer,
			style: `https://undp-data.github.io/style/style.json`,
			center: [0, 0],
			zoom: 4,
			hash: false,
			attributionControl: false
		});

		map.on('load', async () => {
			await addControls();
			await loadStyle();
		});
	});

	const addControls = async () => {
		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'top-right'
		);
		map.addControl(new ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');
		map.addControl(new AttributionControl({ compact: true }), 'bottom-right');

		map.addControl(
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			new MaplibreLegendControl(
				{},
				{
					showDefault: false,
					showCheckbox: true,
					reverseOrder: true,
					onlyRendered: true
				}
			),
			'bottom-left'
		);
	};

	const loadStyle = async () => {
		const url = $page.url.searchParams.get('style');
		if (url) {
			const res = await fetch(url);
			const styleJSON = await res.json();
			map.remove();

			map = new Map({
				container: mapContainer,
				style: styleJSON,
				center: map.getCenter(),
				zoom: map.getZoom(),
				bearing: map.getBearing(),
				pitch: map.getPitch(),
				hash: true,
				attributionControl: false
			});
			if (styleJSON.zoom) map.setZoom(styleJSON.zoom);
			if (styleJSON.bearing) map.setBearing(styleJSON.bearing);
			if (styleJSON.pitch) map.setPitch(styleJSON.pitch);
			if (styleJSON.center) map.setCenter(styleJSON.center);

			map.on('load', async () => {
				await addControls();
				isMapLoaded = true;
			});
		}
	};
</script>

<div class="map" id="map" bind:this={mapContainer} />

{#if isMapLoaded}
	<CurrentLocation bind:map isHover={false} position="top-left" />
	<MapExportControl bind:map showPrintableArea={true} showCrosshair={true} position="top-right" />
	<AttributePopupControl bind:map />
{/if}

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';
	@import '@watergis/maplibre-gl-legend/dist/maplibre-gl-legend.css';

	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
		z-index: 1;
	}
</style>
