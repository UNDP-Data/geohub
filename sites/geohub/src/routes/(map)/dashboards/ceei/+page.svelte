<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { Sidebar } from '@undp-data/svelte-sidebar';
	import {
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl,
		addProtocol
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	import LayerControl from './components/LayerControl.svelte';
	import { layers as layerStore, map as mapStore } from './stores';
	import { loadInitial } from './utils/layerHelper';

	let drawerWidth = '355px';
	let map: Map;
	let mapContainer: HTMLDivElement;
	let styles = MapStyles;
	const headerHeightStore = createHeaderHeightStore();

	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);

		map = new Map({
			container: mapContainer,
			style: styles[0].uri,
			center: [0, 0],
			zoom: 2.5,
			hash: true,
			attributionControl: false
		});

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
		map.getCanvas().style.cursor = 'pointer';

		const styleSwitcher = new MaplibreStyleSwitcherControl(MapStyles, {});
		map.addControl(styleSwitcher, 'bottom-left');

		map.on('load', () => {
			map.resize();

			styleSwitcher.initialise();
		});

		mapStore.update(() => map);

		mapStore.subscribe(() => {
			if ($mapStore) {
				$mapStore.on('load', () => {
					loadLayers();
				});
			}
		});

		loadInitial();
	});

	const loadLayers = () => {
		if ($layerStore) {
			for (const layer of $layerStore) {
				map.addSource(layer.sourceName, layer.source);
				map.addLayer(layer.layer);
			}
		}
	};
</script>

<Header isPositionFixed={true} />

<Sidebar show={true} position="right" bind:width={drawerWidth} bind:marginTop={$headerHeightStore}>
	<div
		slot="content"
		class="drawer-content m-0 px-4 pt-6 is-flex is-flex-direction-column is-gap-1"
	>
		<div class="is-flex is-flex-direction-column is-gap-1">
			{#each $layerStore as l, i}
				<div>
					<LayerControl layerDetails={l} index={i} />
				</div>
			{/each}
		</div>
	</div>
	<div slot="main">
		<div class="map" id="map" bind:this={mapContainer} />
	</div>
</Sidebar>

<style lang="scss">
	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}

	.drawer-content {
		width: 100%;
		height: 100%;
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-basis: 100%;
		flex: 1;
	}
</style>
