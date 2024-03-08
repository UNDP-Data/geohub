<script lang="ts">
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import FillColor from '$components/maplibre/fill/FillColor.svelte';
	import FillOutlineColor from '$components/maplibre/fill/FillOutlineColor.svelte';
	import VectorSimpleColorLegend from '$components/maplibre/vector/VectorSimpleColorLegend.svelte';
	import VectorSimulationAccordion from '$components/maplibre/vector/VectorSimulationAccordion.svelte';
	import Legend from '$components/pages/map/layers/header/Legend.svelte';
	import Accordion from '$components/util/Accordion.svelte';
	import { getLayerStyle } from '$lib/helper';
	import type { Tag, VectorTileMetadata } from '$lib/types';
	import {
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { Help } from '@undp-data/svelte-undp-components';
	import { getContext, onMount } from 'svelte';

	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let tags: Tag[];

	let layerStyle = getLayerStyle($map, layerId);
	let isSimpleLegend = true;

	onMount(() => {
		const color = $map.getPaintProperty(layerId, 'fill-color');
		if (color && ['interval', 'categorical'].includes(color['type'])) {
			isSimpleLegend = false;
		} else if (color && Array.isArray(color) && ['match', 'step'].includes(color[0])) {
			isSimpleLegend = false;
		} else {
			isSimpleLegend = true;
		}
	});

	let expanded: { [key: string]: boolean } = { 'fill-color': true };
	// to allow only an accordion to be expanded
	let expandedDatasetId: string;
	$: {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	}
</script>

{#if !$legendReadonly}
	<VectorSimulationAccordion {layerId} {tags} bind:expanded />

	<Accordion title="Fill color" bind:isExpanded={expanded['fill-color']}>
		<div class="pb-2" slot="content">
			<FillColor {layerId} {metadata} />
		</div>
		<div slot="buttons">
			<Help>Change polygon fill color by using single color or selected property.</Help>
		</div>
	</Accordion>

	<Accordion title="Fill outline color" bind:isExpanded={expanded['fill-outline-color']}>
		<div class="pb-2" slot="content">
			<FillOutlineColor {layerId} />
		</div>
		<div slot="buttons">
			<Help>Change polygon outline color.</Help>
		</div>
	</Accordion>

	<Accordion title="Opacity" bind:isExpanded={expanded['opacity']}>
		<div class="pb-2" slot="content">
			<OpacitySlider bind:layerId />
		</div>
		<div slot="buttons">
			<Help>The opacity at which the image will be drawn.</Help>
		</div>
	</Accordion>
{:else if isSimpleLegend}
	<Legend layer={layerStyle} />
{:else}
	<VectorSimpleColorLegend {layerId} {metadata} propertyName="fill-color" />
{/if}
