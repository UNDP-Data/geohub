<script lang="ts">
	import { MapStyles } from '$lib/config/AppConfig';
	import type { DatasetFeatureCollection } from '$lib/types';
	import { Map, NavigationControl, type MapGeoJSONFeature } from 'maplibre-gl';
	import { onMount } from 'svelte';

	export let datasets: DatasetFeatureCollection;

	let mapContainer: HTMLDivElement;
	let map: Map;
	let height = 0;
	let innerHeight: number;
	$: mapHeight = height > 0 ? height : innerHeight * 0.6;

	const mapSourceId = 'geohub-datasets';
	let hoveredFeature: MapGeoJSONFeature;

	onMount(() => {
		initialiseMap();
	});

	$: datasets, addDatasetsToMap();

	const initialiseMap = () => {
		map = new Map({
			container: mapContainer,
			style: MapStyles[0].uri,
			center: [0, 0],
			zoom: 0,
			maxZoom: 14
		});

		map.addControl(new NavigationControl(), 'bottom-right');

		map.once('load', () => {
			map.resize();
			map.redraw();

			addDatasetsToMap();
		});
	};

	const addDatasetsToMap = () => {
		if (!map) return;
		if (!map.loaded()) return;
		if (map.getSource(mapSourceId)) {
			const layers = map.getStyle().layers.filter((l) => {
				return l['source'] === mapSourceId;
			});
			layers.forEach((l) => {
				if (map.getLayer(l.id)) {
					map.removeLayer(l.id);
				}
			});
		}

		map.addSource(mapSourceId, {
			type: 'geojson',
			data: datasets,
			promoteId: 'id'
		});

		map.addLayer({
			id: `${mapSourceId}-fill`,
			type: 'fill',
			source: mapSourceId,
			layout: {
				visibility: 'visible'
			},
			paint: {
				'fill-color': [
					'case',
					['boolean', ['feature-state', 'hover'], false],
					'rgba(0,110,181, 0.6)',
					'rgba(0,110,181, 0.2)'
				],
				'fill-outline-color': '#006eb5'
			}
		});

		map.addLayer({
			id: `${mapSourceId}-fill-label`,
			type: 'symbol',
			source: mapSourceId,
			layout: {
				visibility: 'visible',
				'text-field': ['get', 'name'],
				'text-font': ['Proxima Nova Semibold'],
				'text-max-width': 5,
				'text-size': 12
			},
			paint: {
				'text-halo-color': '#FFFFFF',
				'text-halo-width': 1,
				'text-color': '#d12800'
			}
		});

		map.on('mousemove', (e) => {
			if (hoveredFeature) {
				map.setFeatureState(hoveredFeature, { hover: false });
			}

			hoveredFeature = undefined;
			const { x, y } = e.point;
			let features = map.queryRenderedFeatures([x, y], { layers: [`${mapSourceId}-fill`] });
			if (features?.length > 0) {
				hoveredFeature = features[0];
				map.setFeatureState(hoveredFeature, { hover: true });
			}
		});
	};
</script>

<svelte:window bind:innerHeight />

<div class="map-viewer" style="height: {mapHeight}px;">
	<div bind:this={mapContainer} class="map"></div>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map-viewer {
		position: relative;
		width: 100%;

		.map {
			position: relative;
			width: 100%;
			height: 100%;
		}
	}
</style>
