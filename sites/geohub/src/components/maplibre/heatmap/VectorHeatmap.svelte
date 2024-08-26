<script lang="ts">
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import HeatmapColor from '$components/maplibre/heatmap/HeatmapColor.svelte';
	import HeatmapIntensity from '$components/maplibre/heatmap/HeatmapIntensity.svelte';
	import HeatmapRadius from '$components/maplibre/heatmap/HeatmapRadius.svelte';
	import HeatmapWeight from '$components/maplibre/heatmap/HeatmapWeight.svelte';
	import VectorSimulationAccordion from '$components/maplibre/vector/VectorSimulationAccordion.svelte';
	import type { Tag } from '$lib/types';
	import { Accordion, Help } from '@undp-data/svelte-undp-components';

	export let layerId: string;
	export let tags: Tag[];
	let expanded: { [key: string]: boolean } = {
		'heatmap-color': true
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

<Accordion title="Heatmap color" bind:isExpanded={expanded['heatmap-color']}>
	<div class="pb-2" slot="content">
		<HeatmapColor {layerId} />
	</div>
	<div slot="buttons">
		<Help>Defines the color of each pixel based on its density value in a heatmap.</Help>
	</div>
</Accordion>

<Accordion title="Heatmap Intensity" bind:isExpanded={expanded['heatmap-intensity']}>
	<div class="pb-2" slot="content">
		<HeatmapIntensity {layerId} />
	</div>
	<div slot="buttons">
		<Help>
			Similar to heatmap weight but controls the intensity of the heatmap globally. Primarily used
			for adjusting the heatmap based on zoom level.
		</Help>
	</div>
</Accordion>

<Accordion title="Heatmap Radius" bind:isExpanded={expanded['heatmap-radius']}>
	<div class="pb-2" slot="content">
		<HeatmapRadius {layerId} />
	</div>
	<div slot="buttons">
		<Help>
			Radius of influence of one heatmap point in pixels. Increasing the value makes the heatmap
			smoother, but less detailed.
		</Help>
	</div>
</Accordion>

<Accordion title="Heatmap Weight" bind:isExpanded={expanded['heatmap-weight']}>
	<div class="pb-2" slot="content">
		<HeatmapWeight {layerId} />
	</div>
	<div slot="buttons">
		<Help>
			A measure of how much an individual point contributes to the heatmap. A value of 10 would be
			equivalent to having 10 points of weight 1 in the same spot. Especially useful when combined
			with clustering.
		</Help>
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
