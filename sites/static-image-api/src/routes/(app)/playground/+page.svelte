<script lang="ts">
	import { page } from '$app/stores';
	import maplibregl, { Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import {
		MaplibreStaticImageControl,
		type ControlOptions
	} from '@undp-data/svelte-geohub-static-image-controls';
	import { onMount } from 'svelte';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	let styleUrl: string = $page.url.searchParams.get('url') as string;

	let origin = $page.url.origin;
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
		retina: false,
		defaultApi: 'center',
		extension: 'webp',
		pageSize: 'custom',
		dpi: 96,
		orientation: 'portrait'
	};

	let mapContainer: HTMLDivElement;

	let map: Map;

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: styleUrl
		});

		map.addControl(new NavigationControl(), 'bottom-right');
		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

		map.on('load', () => {
			map.resize();
		});
	});

	const handleUrlChanged = (e) => {
		apiUrl = e.detail.url;
	};
</script>

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
			showAdvanced={true}
			bind:style={styleUrl}
			apiBase="{origin}/api"
			bind:options
			on:change={handleUrlChanged}
		/>
	{/if}
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map {
		position: relative;
		width: 100%;
		height: 70vh;
	}
</style>
