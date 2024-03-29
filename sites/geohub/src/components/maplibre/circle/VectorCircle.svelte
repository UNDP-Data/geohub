<script lang="ts">
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import CircleColor from '$components/maplibre/circle/CircleColor.svelte';
	import CircleRadius from '$components/maplibre/circle/CircleRadius.svelte';
	import CircleStrokeColor from '$components/maplibre/circle/CircleStrokeColor.svelte';
	import CircleStrokeWidth from '$components/maplibre/circle/CircleStrokeWidth.svelte';
	import VectorSimpleColorLegend from '$components/maplibre/vector/VectorSimpleColorLegend.svelte';
	import VectorSimulationAccordion from '$components/maplibre/vector/VectorSimulationAccordion.svelte';
	import Legend from '$components/pages/map/layers/header/Legend.svelte';
	import { getLayerStyle } from '$lib/helper';
	import type { Tag, VectorTileMetadata } from '$lib/types';
	import {
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { Accordion, Help } from '@undp-data/svelte-undp-components';
	import { getContext, onMount } from 'svelte';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let tags: Tag[];

	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	let layerStyle = getLayerStyle($map, layerId);
	let isSimpleLegend = true;

	onMount(() => {
		const color = $map.getPaintProperty(layerId, 'circle-color');
		if (color && ['interval', 'categorical'].includes(color['type'])) {
			isSimpleLegend = false;
		} else if (color && Array.isArray(color) && ['match', 'step'].includes(color[0])) {
			isSimpleLegend = false;
		} else {
			isSimpleLegend = true;
		}
	});

	let expanded: { [key: string]: boolean } = {
		'circle-radius': true
	};
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

	<Accordion title="Circle radius" bind:isExpanded={expanded['circle-radius']}>
		<div class="pb-2" slot="content">
			<CircleRadius {layerId} bind:readonly={$legendReadonly} />
		</div>
		<div slot="buttons">
			<Help>Apply circle radius to the vector layer.</Help>
		</div>
	</Accordion>

	<Accordion title="Circle color" bind:isExpanded={expanded['circle-color']}>
		<div class="pb-2" slot="content">
			<CircleColor {layerId} {metadata} />
		</div>
		<div slot="buttons">
			<Help>Change circle color by using single color or selected property</Help>
		</div>
	</Accordion>

	<Accordion title="Circle stroke color" bind:isExpanded={expanded['circle-stroke-color']}>
		<div class="pb-2" slot="content">
			<CircleStrokeColor {layerId} />
		</div>
		<div slot="buttons">
			<Help>The stroke color of the circle.</Help>
		</div>
	</Accordion>

	<Accordion title="Circle stroke width" bind:isExpanded={expanded['circle-stroke-width']}>
		<div class="pb-2" slot="content">
			<CircleStrokeWidth {layerId} />
		</div>
		<div slot="buttons">
			<Help>The width of the circle's stroke. Strokes are placed outside of the circle radius.</Help
			>
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
	<VectorSimpleColorLegend {layerId} {metadata} propertyName="circle-color" />
{/if}
