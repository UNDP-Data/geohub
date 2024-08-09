<script lang="ts">
	import { MapStyles } from '$lib/config/AppConfig';
	import type { DatasetFeatureCollection } from '$lib/types';
	import { FieldControl, clean, handleEnterKey } from '@undp-data/svelte-undp-components';
	import { Checkbox, CtaLink } from '@undp-data/svelte-undp-design';
	import { Map, NavigationControl, Popup, type MapGeoJSONFeature } from 'maplibre-gl';
	import { onMount } from 'svelte';

	export let datasets: DatasetFeatureCollection;
	export let hideGlobal = false;

	let mapContainer: HTMLDivElement;
	let popupContainer: HTMLDivElement;
	let map: Map;
	let popup: Popup;
	let height = 0;
	let innerHeight: number;
	$: mapHeight = height > 0 ? height : innerHeight * 0.6;

	const mapSourceId = 'geohub-datasets';
	const mapPolygonLayerId = `${mapSourceId}-fill`;
	let hoveredFeature: MapGeoJSONFeature;
	let clickedFeatures: MapGeoJSONFeature[] = [];
	let activeFeatureIndex: number;

	onMount(() => {
		initialiseMap();
	});

	$: datasets, addDatasetsToMap();
	$: hideGlobal, addDatasetsToMap();

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
			map.on('click', `${mapSourceId}-fill`, handleClickFeature);

			addDatasetsToMap();
		});
	};

	const handleClickFeature = (e) => {
		if (!('features' in e)) return;
		const { x, y } = e.point;
		clickedFeatures = map.queryRenderedFeatures([x, y], { layers: [mapPolygonLayerId] });
		activeFeatureIndex = -1;
		if (popup) {
			popup.remove();
			popup = undefined;
		}

		if (clickedFeatures.length === 0) return;
		activeFeatureIndex = 0;
		popup = new Popup()
			.setLngLat(e.lngLat)
			.setMaxWidth('350px')
			.setDOMContent(popupContainer)
			.addTo(map);
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
			map.removeSource(mapSourceId);
		}

		const filteredDatasets: DatasetFeatureCollection = JSON.parse(JSON.stringify(datasets));
		if (hideGlobal) {
			filteredDatasets.features = filteredDatasets.features.filter((f) => {
				const globalTag = f.properties.tags?.find(
					(t) => t.key === 'extent' && t.value.toLowerCase() === 'global'
				);
				const stacTag = f.properties.tags?.find(
					(t) => t.key === 'type' && t.value.toLowerCase() === 'stac'
				);
				return globalTag || stacTag ? false : true;
			});
		}

		map.addSource(mapSourceId, {
			type: 'geojson',
			data: filteredDatasets,
			promoteId: 'id'
		});

		map.addLayer({
			id: mapPolygonLayerId,
			type: 'fill',
			source: mapSourceId,
			layout: {
				visibility: 'visible'
			},
			paint: {
				'fill-color': [
					'case',
					['boolean', ['feature-state', 'hover'], false],
					'rgba(56, 175, 252, 0.6)',
					'rgba(56, 175, 252, 0.2)'
				],
				'fill-outline-color': '#006eb5'
			}
		});

		map.addLayer({
			id: `${mapPolygonLayerId}-label`,
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
			let features = map.queryRenderedFeatures([x, y], { layers: [mapPolygonLayerId] });
			if (features?.length > 0) {
				hoveredFeature = features[0];
				map.setFeatureState(hoveredFeature, { hover: true });
			}
		});
	};
</script>

<svelte:window bind:innerHeight />

<div class="map-viewer" style="height: {mapHeight}px;">
	<div bind:this={mapContainer} class="map" />
	<div class="overlay has-background-white p-2">
		<Checkbox label="Hide global/satellite datasets from the map" bind:checked={hideGlobal} />
	</div>
</div>

<div class="popup" bind:this={popupContainer}>
	{#if clickedFeatures?.length > 0}
		<div class="tabs is-centered is-boxed">
			<ul>
				{#each Array(clickedFeatures.length).keys() as index}
					<li class={index === activeFeatureIndex ? 'is-active' : ''}>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							role="tab"
							tabindex="0"
							data-sveltekit-preload-code="off"
							data-sveltekit-preload-data="off"
							on:click={() => {
								activeFeatureIndex = index;
							}}
							on:keydown={handleEnterKey}
						>
							<span>{index + 1}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
		{#each clickedFeatures as feature, index}
			{#if index === activeFeatureIndex}
				{@const name = clean(feature.properties.name)}
				{@const description = feature.properties.description}
				{@const license = feature.properties.license}
				<p class="is-size-6 is-caplitalized has-text-weight-bold mb-2">{name}</p>

				<FieldControl title="description" showHelp={false}>
					<div slot="control" class="is-size-6 description">
						{description}
					</div>
				</FieldControl>

				<FieldControl title="license" showHelp={false}>
					<div slot="control" class="is-size-6">
						{license}
					</div>
				</FieldControl>

				<CtaLink label="READ MORE" isArrow={false} href="/data/{feature.properties.id}" />
			{/if}
		{/each}
	{/if}
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

		.overlay {
			position: absolute;
			top: 5px;
			left: 5px;
		}

		.popup {
			.description {
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 3;
			}
		}
	}
</style>
