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
	export let source: SourceSpecification;
	export let layer: LayerSpecification;

	let mapContainer: HTMLDivElement | undefined = undefined;

	export let style = 'https://dev.undpgeohub.org/api/mapstyle/style.json';

	onMount(() => {
		let protocol = new Protocol();
		addProtocol('pmtiles', protocol.tile);
		if (!mapContainer) return;

		$mapStore = new Map({
			container: mapContainer,
			style
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
			if ('source' in layer) {
				if (!$mapStore.getSource(layer.source)) {
					$mapStore.addSource(layer.source, source);
				}
				if (!$mapStore.getLayer(layer.id)) {
					$mapStore.addLayer(layer);
				}
			}
		});
	});
</script>

<div class="map" bind:this={mapContainer}></div>

<FieldControl {title} showHelp={false}>
	<div slot="control">
		<slot />
	</div>
</FieldControl>

<style lang="scss">
	.map {
		position: relative;
		width: 100%;
		height: 300px;
	}
</style>
