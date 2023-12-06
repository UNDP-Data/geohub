<script lang="ts">
	import { MaplibreStaticImageControl } from '$lib';
	import type { ControlOptions } from '$lib/interface/index.js';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';
	import '@undp-data/undp-bulma/dist/style.css';
	import maplibregl, { Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	let mapContainer: HTMLDivElement;

	let map: Map;

	let styleUrl = 'https://unpkg.com/@undp-data/style@latest/dist/style.json';

	let loadedUrl = styleUrl;
	let apiUrl = '';

	let options: ControlOptions = {
		width: 300,
		height: 200,
		bbox: [-180, -90, 180, 90],
		latitude: 0,
		longitude: 0,
		zoom: 3,
		bearing: 0,
		pitch: 0,
		ratio: 1,
		defaultApi: 'center',
		extension: 'webp',
		pageSize: 'custom',
		orientation: 'portrait'
	};

	const initMap = () => {
		map = new Map({
			container: mapContainer,
			style: styleUrl,
			center: [0, 0],
			zoom: 0,
			bearing: 0,
			pitch: 0
		});

		map.addControl(new NavigationControl(), 'bottom-right');
		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		map.on('load', () => {
			map.resize();
		});
	};

	onMount(() => {
		initMap();
	});

	const handleUrlChanged = (e: { detail: { url: string } }) => {
		apiUrl = e.detail.url;
	};

	const handleClickLoad = () => {
		initMap();
		loadedUrl = styleUrl;
	};
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
		integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

<div class="field m-1">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="label">Style URL</label>
	<div class="control">
		<div class="is-flex">
			<input class="input" bind:value={styleUrl} />
			<button class="button is-link ml-1" on:click={handleClickLoad}>Load</button>
		</div>
	</div>
</div>

<div class="field m-1">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="label">Static image URL</label>
	<div class="control">
		<CopyToClipboard bind:value={apiUrl} />
	</div>
</div>

<div bind:this={mapContainer} class="map">
	{#if map}
		<MaplibreStaticImageControl
			bind:map
			show={true}
			bind:style={loadedUrl}
			apiBase="https://staticimage.undpgeohub.org/api"
			bind:options
			on:change={handleUrlChanged}
		/>
	{/if}
</div>

<style lang="scss">
	$height: calc(80vh);
	.map {
		position: relative;
		width: 100%;
		height: $height;
	}
</style>
