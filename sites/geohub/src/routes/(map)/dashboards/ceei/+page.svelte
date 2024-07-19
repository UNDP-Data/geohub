<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { Sidebar } from '@undp-data/svelte-sidebar';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { SvelteToast } from '@zerodevx/svelte-toast';
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
	import { layers as layerStore, map as mapStore, type Layer } from './stores';
	import { loadInitial } from './utils/layerHelper';

	let drawerWidth = '355px';
	let map: Map;
	let mapContainer: HTMLDivElement;
	let styles = MapStyles;

	const headerHeightStore = createHeaderHeightStore();

	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	const loadDatasets = async (): Promise<Layer> => {
		const geohubUrl = 'https://undpgeohub.blob.core.windows.net/ceei/ceei-data.geojson';
		let globalCeeiJson = await fetch(geohubUrl).then((res) => res.json());

		return {
			name: 'Global CEEI',
			isVisible: true,
			sourceId: 'Global CEEI' + '-source',
			bounds: globalCeeiJson.bbox,
			source: {
				type: 'geojson',
				data: globalCeeiJson,
				promoteId: 'fid'
			},
			layerId: 'Global CEEI' + '-layer',
			layer: {
				id: 'Global CEEI' + '-layer',
				type: 'fill',
				source: 'Global CEEI' + '-source',
				layout: {
					visibility: 'visible'
				},
				paint: {
					'fill-color': [
						'interpolate',
						['linear'],
						['get', 'CEEI'],
						0,
						'#a50026',
						0.25,
						'#f46d43',
						0.5,
						'#fee090',
						0.75,
						'#e0f3f8',
						1,
						'#74add1'
					],
					'fill-opacity': 0.7
				}
			},
			isMapLoaded: false,
			isDataLoaded: false,
			data: globalCeeiJson.features.map((f: { properties: unknown }) => f.properties)
		};
	};

	onMount(async () => {
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

		loadDatasets().then((initialLayer) => {
			loadInitial(initialLayer);
		});
	});
</script>

<Header isPositionFixed={true} />

<Sidebar show={true} position="right" bind:width={drawerWidth} bind:marginTop={$headerHeightStore}>
	<div
		slot="content"
		class="drawer-content m-0 px-4 pt-6 is-flex is-flex-direction-column is-gap-1"
	>
		<div class="is-flex is-flex-direction-column is-gap-1">
			{#if $layerStore.length === 0}
				<div
					class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
				>
					<Loader />
					<div>Loading data...</div>
				</div>
			{:else}
				{#each $layerStore as l, i}
					<div>
						<LayerControl layerDetails={l} index={i} />
					</div>
				{/each}
			{/if}
		</div>
	</div>
	<div slot="main">
		<SvelteToast />
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
