<script lang="ts">
	import { page } from '$app/stores';
	import { SegmentButtons, Slider } from '@undp-data/svelte-undp-components';
	import type { HeatmapLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import { map } from '../stores';
	import { getChoropleth, loadAdmin, setAzureUrl, setOpacity } from '../utils/adminLayer';

	const azureUrl = $page.data.azureUrl;
	setAzureUrl(azureUrl);

	const POVERTY_URL = [`${azureUrl}/admin/poverty_points/{z}/{x}/{y}.pbf`];
	const OVERLAY_ID = 'overlay';
	const ADMIN_ID = 'adm';
	export let POVERTY_ID = 'poverty';
	const NONE_ID = 'none';

	let overlayChoices = [
		{ value: ADMIN_ID, icon: 'fas fa-dice-d6', title: ADMIN_ID },
		{ value: POVERTY_ID, icon: 'fas fa-hand-holding-dollar', title: POVERTY_ID },
		{ value: NONE_ID, icon: 'fas fa-ban', title: NONE_ID }
	];
	export let overlaySelected = overlayChoices[0].value;

	let layerOpacity = 0.8;
	let rangeSliderValues = [layerOpacity * 100];
	$: layerOpacity = rangeSliderValues[0] / 100;
	$: layerOpacity, setLayerOpacity();
	$: overlaySelected, loadLayer();

	const setLayerOpacity = () => {
		if ($map && $map.getLayer(OVERLAY_ID)) {
			$map.setPaintProperty(OVERLAY_ID, 'heatmap-opacity', layerOpacity);
		}
		if ($map && $map.getLayer('admin')) {
			$map.setPaintProperty('admin', 'fill-opacity', layerOpacity);
			setOpacity(layerOpacity);
		}
	};

	const loadLayer = () => {
		$map.getLayer(OVERLAY_ID) && $map.removeLayer(OVERLAY_ID);
		$map.getSource(OVERLAY_ID) && $map.removeSource(OVERLAY_ID);
		if (overlaySelected === ADMIN_ID && !getChoropleth()) {
			loadAdmin(true);
			setLayerOpacity();
		} else if (overlaySelected === POVERTY_ID) {
			loadAdmin(false);
			loadPoverty();
			setLayerOpacity();
		} else if (overlaySelected === NONE_ID) {
			loadAdmin(false);
		}
	};

	const loadPoverty = () => {
		if (!$map.getSource(OVERLAY_ID)) {
			const layerSource: VectorSourceSpecification = {
				type: 'vector',
				tiles: POVERTY_URL,
				maxzoom: 10
			};
			$map.addSource(OVERLAY_ID, layerSource);
		}

		if (!$map.getLayer(OVERLAY_ID)) {
			const layerDefinition: HeatmapLayerSpecification = {
				id: OVERLAY_ID,
				type: 'heatmap',
				source: OVERLAY_ID,
				'source-layer': 'poverty_points',
				paint: {
					'heatmap-weight': ['interpolate', ['exponential', 2], ['get', 'poverty'], 0, 0, 2.022, 1],
					'heatmap-intensity': ['interpolate', ['exponential', 2], ['zoom'], 0, 0, 10, 5],
					'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 0, 10, 30]
				}
			};
			$map.addLayer(layerDefinition);
		}
	};
</script>

<div class="is-flex is-justify-content-center">
	<SegmentButtons
		buttons={overlayChoices}
		bind:selected={overlaySelected}
		size="small"
		capitalized={true}
	/>
</div>

{#if overlayChoices
	.map((x) => x.value)
	.slice(0, 2)
	.includes(overlaySelected)}
	<div class="action">
		<div class="slider">
			<Slider
				bind:values={rangeSliderValues}
				min={0}
				max={100}
				step={1}
				pips
				first="label"
				last="label"
				rest={false}
				suffix="%"
			/>
		</div>
	</div>
{/if}
