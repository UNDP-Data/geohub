<script lang="ts">
	import { MaplibreStaticImageControl } from '$lib';
	import type { ControlOptions } from '$lib/interface/index.js';
	import { CopyToClipboard } from '@undp-data/svelte-undp-components';
	import '@undp-data/undp-bulma/dist/undp-bulma.css';
	import { addProtocol, Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';

	let mapContainer: HTMLDivElement | undefined = $state();

	let map: Map | undefined = $state();

	let styleUrl = $state('https://dev.undpgeohub.org/api/mapstyle/style.json');
	const getDefaultStyleUrl = () => {
		return styleUrl;
	};
	let loadedUrl = $state(getDefaultStyleUrl());
	let apiUrl = $state('');

	let options: ControlOptions = $state({
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
	});

	const initMap = () => {
		if (!mapContainer) return;
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);

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
			if (!map) return;
			map.resize();
		});
	};

	onMount(() => {
		initMap();
	});

	const handleUrlChanged = (url: string) => {
		apiUrl = url;
	};

	const handleClickLoad = () => {
		initMap();
		loadedUrl = styleUrl;
	};
</script>

<div class="field m-1">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="label">Style URL</label>
	<div class="control">
		<div class="is-flex">
			<input class="input" bind:value={styleUrl} />
			<button class="button is-link ml-1" onclick={handleClickLoad}>Load</button>
		</div>
	</div>
</div>

<div class="field m-1">
	<!-- svelte-ignore a11y_label_has_associated_control -->
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
			onchange={handleUrlChanged}
			hiddenApiTypes={false}
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
