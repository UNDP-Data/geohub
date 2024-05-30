<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { AdminControlOptions, MapStyles } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import '@undp-data/cgaz-admin-tool/dist/maplibre-cgaz-admin-control.css';
	import MaplibreStyleSwitcherControl from '@undp-data/style-switcher';
	import '@undp-data/style-switcher/dist/maplibre-style-switcher.css';
	import { Sidebar } from '@undp-data/svelte-sidebar';
	import { Button } from '@undp-data/svelte-undp-design';
	import {
		AttributionControl,
		GeolocateControl,
		Map,
		NavigationControl,
		ScaleControl
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount, setContext } from 'svelte';
	import LayerControl from './components/LayerControl.svelte';
	import { layers as layerStore, map as mapStore } from './stores';

	let drawerWidth = '355px';
	let map: Map;
	let mapContainer: HTMLDivElement;
	let styles = MapStyles;
	const headerHeightStore = createHeaderHeightStore();

	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

	onMount(() => {
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

			const adminOptions = AdminControlOptions;
			adminOptions.isHover = true;
		});

		mapStore.update(() => map);

		mapStore.subscribe(() => {
			if ($mapStore) {
				$mapStore.on('load', () => {
					loadLayers();
				});
			}
		});
	});

	const loadLayers = () => {
		if ($layerStore) {
			for (const layer of $layerStore) {
				map.addSource(layer.sourceName, layer.source);
				map.addLayer(layer.layer);
			}
		}
	};

	const addLayer = (layer) => {
		$layerStore = [...$layerStore, layer];
		map.addSource(layer.sourceName, layer.source);
		map.addLayer(layer.layer);
	};

	const tempAddDefault = (name) => {
		const sourceName = `${name}-source`;
		const layerName = `${name}-fill`;

		const newLayer = {
			name,
			sourceName,
			source: {
				type: 'geojson',
				data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_urban_areas.geojson'
			},
			layerName,
			layer: {
				id: layerName,
				type: 'fill',
				source: sourceName,
				layout: {},
				paint: {
					'fill-color': '#f08',
					'fill-opacity': 0.4
				}
			}
		};

		addLayer(newLayer);
	};

	const deleteLayer = (index: number) => {
		map.removeLayer($layerStore[index].layerName);
		map.removeSource($layerStore[index].sourceName);
		$layerStore = $layerStore.toSpliced(index, 1);
	};
</script>

<Header isPositionFixed={true} />

<Sidebar show={true} position="right" bind:width={drawerWidth} bind:marginTop={$headerHeightStore}>
	<div
		slot="content"
		class="drawer-content m-0 px-4 pt-6 is-flex is-flex-direction-column is-gap-1"
	>
		<Button title="Add Layer" on:clicked={() => tempAddDefault(`layer-${new Date().getTime()}`)}
		></Button>
		<div class="is-flex is-flex-direction-column is-gap-1">
			{#each $layerStore as l, i}
				<!-- TEMP: for experimental purposes, to be removed in final interation -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div on:click={() => deleteLayer(i)}>
					<LayerControl title={l.name} />
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
