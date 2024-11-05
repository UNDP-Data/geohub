<script lang="ts">
	import FieldControl from '$lib/components/ui/FieldControl.svelte';
	import { createMapStore, MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import {
		addProtocol,
		GeolocateControl,
		Map,
		NavigationControl,
		TerrainControl,
		type LayerSpecification,
		type SourceSpecification
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { Protocol } from 'pmtiles';
	import { onMount, setContext } from 'svelte';

	const mapStore: MapStore = createMapStore();
	setContext(MAPSTORE_CONTEXT_KEY, mapStore);

	export let title: string;
	export let source: SourceSpecification | undefined = undefined;
	export let layer: LayerSpecification | undefined = undefined;

	export let center = [0, 0];
	export let zoom = 3;
	export let bearing = 0;
	export let pitch = 0;

	let mapContainer: HTMLDivElement | undefined = undefined;

	export let style = 'https://dev.undpgeohub.org/api/mapstyle/style.json';

	let isLoaded = false;

	onMount(() => {
		let protocol = new Protocol();
		addProtocol('pmtiles', protocol.tile);
		if (!mapContainer) return;

		$mapStore = new Map({
			container: mapContainer,
			style,
			center: [center[0], center[1]],
			zoom,
			bearing,
			pitch,
			maxPitch: 85
		});
		$mapStore.addControl(
			new NavigationControl({
				visualizePitch: true,
				showZoom: true,
				showCompass: true
			}),
			'bottom-right'
		);
		$mapStore.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true
			}),
			'bottom-right'
		);
		$mapStore.addControl(
			new TerrainControl({
				source: 'terrarium',
				exaggeration: 1
			}),
			'bottom-right'
		);

		$mapStore.once('load', () => {
			if (layer && 'source' in layer) {
				if (!$mapStore.getSource(layer.source) && source) {
					$mapStore.addSource(layer.source, source);
				}
				if (!$mapStore.getLayer(layer.id)) {
					$mapStore.addLayer(layer);
				}
			}
			isLoaded = true;
		});
	});
</script>

<div class="map" bind:this={mapContainer}></div>

<FieldControl {title} showHelp={false}>
	<div slot="control">
		{#if isLoaded}
			<slot />
		{/if}
	</div>
</FieldControl>

<style lang="scss">
	.map {
		position: relative;
		width: 100%;
		height: 300px;
	}
</style>
