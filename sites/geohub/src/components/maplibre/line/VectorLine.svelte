<script lang="ts">
	import { page } from '$app/stores';
	import VectorColorClassification from '$components/maplibre/vector/VectorColorClassification.svelte';
	import VectorSimulationAccordion from '$components/maplibre/vector/VectorSimulationAccordion.svelte';
	import VectorValueClassification from '$components/maplibre/vector/VectorValueClassification.svelte';
	import type { Tag } from '$lib/types';
	import { DEFAULTCOLOR_CONTEXT_KEY, type DefaultColorStore } from '$stores';
	import {
		Accordion,
		Help,
		LinePattern,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { getContext } from 'svelte';

	const defaultColorStore: DefaultColorStore = getContext(DEFAULTCOLOR_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let tags: Tag[];

	let defaultLineWidth = $page.data.config.LineWidth;

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
		<VectorValueClassification
			{layerId}
			{metadata}
			bind:defaultValue={defaultLineWidth}
			minValue={0}
			maxValue={10}
			stepValue={0.1}
			propertyName={'line-width'}
			styleType="paint"
			legendCssTemplate={`margin-top: 13px; width: 40px; height: {value}px; background-color: ${$defaultColorStore};`}
			dataLabel="Line width"
		/>
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
