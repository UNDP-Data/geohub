<script lang="ts">
	import LineWidth from '$components/maplibre/line/LineWidth.svelte';
	import VectorColorClassification from '$components/maplibre/vector/VectorColorClassification.svelte';
	import VectorSimulationAccordion from '$components/maplibre/vector/VectorSimulationAccordion.svelte';
	import type { Tag } from '$lib/types';
	import {
		Accordion,
		Help,
		LinePattern,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let tags: Tag[];

	let expanded: { [key: string]: boolean } = {
		'line-color': true
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

<VectorSimulationAccordion {layerId} {tags} bind:expanded />

<Accordion title="Line color" bind:isExpanded={expanded['line-color']}>
	<div class="pb-2" slot="content">
		<VectorColorClassification
			{layerId}
			{metadata}
			propertyName="line-color"
			onlyNumberFields={false}
		/>
	</div>
	<div slot="buttons">
		<Help>The color with which the line will be drawn.</Help>
	</div>
</Accordion>

<Accordion title="Line width" bind:isExpanded={expanded['line-width']}>
	<div class="pb-2" slot="content">
		<LineWidth {layerId} {metadata} />
	</div>
	<div slot="buttons">
		<Help>Stroke thickness.</Help>
	</div>
</Accordion>

<Accordion title="Line pattern" bind:isExpanded={expanded['line-pattern']}>
	<div class="pb-2" slot="content">
		<LinePattern {layerId} />
	</div>
	<div slot="buttons">
		<Help>Line pattern for drawing.</Help>
	</div>
</Accordion>
