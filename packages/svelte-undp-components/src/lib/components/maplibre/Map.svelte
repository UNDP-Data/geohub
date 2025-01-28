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

	let mapContainer: HTMLDivElement | undefined = $state(undefined);

	interface Props {
		title: string;
		source?: SourceSpecification | undefined;
		layer?: LayerSpecification | undefined;
		center?: number[];
		zoom?: number;
		bearing?: number;
		pitch?: number;
		style?: string;
		children?: import('svelte').Snippet;
	}

	let {
		title = $bindable(),
		source = undefined,
		layer = undefined,
		center = [0, 0],
		zoom = 3,
		bearing = 0,
		pitch = 0,
		style = 'https://dev.undpgeohub.org/api/mapstyle/style.json',
		children
	}: Props = $props();

	let isLoaded = $state(false);

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
	{#snippet control()}
		<div>
			{#if isLoaded}
				{@render children?.()}
			{/if}
		</div>
	{/snippet}
</FieldControl>

<style lang="scss">
	.map {
		position: relative;
		width: 100%;
		height: 300px;
	}
</style>
