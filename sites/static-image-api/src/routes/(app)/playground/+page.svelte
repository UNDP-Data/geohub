<script lang="ts">
	import { page } from '$app/stores';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';
	import {
		MaplibreStaticImageControl,
		type ControlOptions
	} from '@undp-data/svelte-geohub-static-image-controls';
	import { Map, NavigationControl, ScaleControl, addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';

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
		ratio: 1,
		defaultApi: 'center',
		extension: 'webp',
		pageSize: 'custom',
		orientation: 'portrait'
	};

	let mapContainer: HTMLDivElement;

	let map: Map;

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);

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

	const handleUrlChanged = (e: { detail: { url: string } }) => {
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
		height: 80vh;
	}
</style>
