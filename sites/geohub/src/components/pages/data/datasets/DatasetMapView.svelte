<script lang="ts">
	import { MapStyles } from '$lib/config/AppConfig';
	import type { DatasetFeatureCollection } from '$lib/types';
	import { FieldControl, clean, handleEnterKey, loadMap } from '@undp-data/svelte-undp-components';
	import { Checkbox, CtaLink } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { Map, NavigationControl, Popup, type MapGeoJSONFeature } from 'maplibre-gl';
	import { onMount } from 'svelte';

	interface Props {
		datasets: DatasetFeatureCollection;
		hideGlobal?: boolean;
	}

	let { datasets = $bindable(), hideGlobal = $bindable(false) }: Props = $props();

	let mapContainer: HTMLDivElement | undefined = $state();
	let popupContainer: HTMLDivElement | undefined = $state();
	let map: Map;
	let popup: Popup;
	let height = 0;
	let innerHeight: number = $state(0);

	const mapSourceId = 'geohub-datasets';
	const mapPolygonLayerId = `${mapSourceId}-fill`;
	let hoveredFeature: MapGeoJSONFeature | undefined = $state();
	let clickedFeatures: MapGeoJSONFeature[] = $state([]);
	let activeFeatureIndex: number = $state(0);

	onMount(() => {
		if (!mapContainer) return;
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
		});
		addDatasetsToMap();
	});

	const handleClickFeature = (e) => {
		if (!('features' in e)) return;
		if (!popupContainer) return;
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

	const addDatasetsToMap = debounce(async () => {
		if (!map) return;
		if (!datasets) return;
		await loadMap(map);
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
		if (!datasets) return;
		const filteredDatasets: DatasetFeatureCollection = JSON.parse(JSON.stringify(datasets));
		if (hideGlobal === true) {
			filteredDatasets.features = filteredDatasets.features.filter((f) => {
				const globalTag = f.properties.tags?.find(
					(t) => t.key === 'extent' && (t.value as string).toLowerCase() === 'global'
				);

				return globalTag === undefined;
			});
			filteredDatasets.features = filteredDatasets.features.filter((f) => {
				const stacTag = f.properties.tags?.find(
					(t) => t.key === 'type' && (t.value as string).toLowerCase() === 'stac'
				);
				return stacTag === undefined;
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
	}, 300);
	let mapHeight = $derived(height > 0 ? height : innerHeight * 0.6);
	$effect(() => {
		addDatasetsToMap();
	});
</script>

<svelte:window bind:innerHeight />

<div class="map-viewer" style="height: {mapHeight}px;">
	<div bind:this={mapContainer} class="map"></div>
	<div class="overlay has-background-white p-2">
		<Checkbox
			label="Hide global/satellite datasets from the map"
			bind:checked={hideGlobal}
			onclick={addDatasetsToMap}
		/>
	</div>
</div>

<div class="popup" bind:this={popupContainer}>
	{#if clickedFeatures?.length > 0}
		<div class="tabs is-centered is-boxed">
			<ul>
				{#each Array(clickedFeatures.length).keys() as index (index)}
					<li class={index === activeFeatureIndex ? 'is-active' : ''}>
						<!-- svelte-ignore a11y_missing_attribute -->
						<a
							role="tab"
							tabindex="0"
							data-sveltekit-preload-code="off"
							data-sveltekit-preload-data="off"
							onclick={() => {
								activeFeatureIndex = index;
							}}
							onkeydown={handleEnterKey}
						>
							<span>{index + 1}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
		{#each clickedFeatures as feature, index (clickedFeatures.indexOf(feature))}
			{#if index === activeFeatureIndex}
				{@const name = clean(feature.properties.name)}
				{@const description = feature.properties.description}
				{@const license = feature.properties.license}
				<p class="is-size-6 is-caplitalized has-text-weight-bold mb-2">{name}</p>

				<FieldControl title="description" showHelp={false}>
					{#snippet control()}
						<div class="is-size-6 description">
							{description}
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl title="license" showHelp={false}>
					{#snippet control()}
						<div class="is-size-6">
							{license}
						</div>
					{/snippet}
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
	}

	.popup {
		.description {
			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
		}
	}
</style>
