<script lang="ts">
	import ClassificationMethodSelect from '$components/maplibre/ClassificationMethodSelect.svelte';
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import FillColor from '$components/maplibre/fill/FillColor.svelte';
	import FillOutlineColor from '$components/maplibre/fill/FillOutlineColor.svelte';
	import Legend from '$components/pages/map/layers/header/Legend.svelte';
	import Help from '$components/util/Help.svelte';
	import { getLayerStyle } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';
	import {
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import { getContext, onMount } from 'svelte';

	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

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
	<Accordion headerTitle="Fill color" fontSize="medium" bind:isExpanded={expanded['fill-color']}>
		<div class="pb-2" slot="content">
			<FillColor {layerId} {metadata} />
		</div>
		<div slot="button">
			<Help>Change polygon fill color by using single color or selected property.</Help>
		</div>
	</Accordion>

	<Accordion
		headerTitle="Fill outline color"
		fontSize="medium"
		bind:isExpanded={expanded['fill-outline-color']}
	>
		<div class="pb-2" slot="content">
			<FillOutlineColor {layerId} />
		</div>
		<div slot="button">
			<Help>Change polygon outline color.</Help>
		</div>
	</Accordion>

	<Accordion headerTitle="Opacity" fontSize="medium" bind:isExpanded={expanded['opacity']}>
		<div class="pb-2" slot="content">
			<OpacitySlider bind:layerId />
		</div>
		<div slot="button">
			<Help>The opacity at which the image will be drawn.</Help>
		</div>
	</Accordion>

	<Accordion
		headerTitle="Classification method"
		fontSize="medium"
		bind:isExpanded={expanded['classification-method']}
	>
		<div class="pb-2" slot="content">
			<ClassificationMethodSelect />
		</div>
		<div slot="button">
			<Help
				>Whether to apply a classification method for a vector layer in selected property. This
				setting is only used when you select a property to classify the layer appearance.
			</Help>
		</div>
	</Accordion>
{:else if isSimpleLegend}
	<Legend layer={layerStyle} />
{:else}
	<FillColor {layerId} {metadata} />
{/if}
