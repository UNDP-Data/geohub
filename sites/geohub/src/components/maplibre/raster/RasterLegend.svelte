<script lang="ts">
	import Hillshade from '$components/maplibre/hillshade/Hillshade.svelte';
	import Accordion from '$components/util/Accordion.svelte';
	import Help from '$components/util/Help.svelte';
	import type { Link, RasterTileMetadata, Tag } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { type LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import RasterAlgorithms from './RasterAlgorithms.svelte';
	import RasterLegendEdit from './RasterLegendEdit.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];
	export let links: Link[] = [];

	const handleSelectAlgorithm = () => {
		layerStyle = $map.getStyle().layers.find((l: LayerSpecification) => l.id === layerId);
	};

	let expanded: { [key: string]: boolean } = {
		color: true
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

	let layerStyle: LayerSpecification;

	onMount(() => {
		layerStyle = $map.getStyle().layers.find((l: LayerSpecification) => l.id === layerId);
	});
</script>

<div class="legend-container">
	<Accordion title="layer type" bind:isExpanded={expanded['algorithm']}>
		<div slot="content">
			<RasterAlgorithms bind:layerId bind:metadata bind:links on:change={handleSelectAlgorithm} />
		</div>
		<div slot="buttons">
			<Help>Apply an algorithm to visualize the raster dataset as a different layer type.</Help>
		</div>
	</Accordion>

	{#if layerStyle && layerStyle.type === 'hillshade'}
		<Hillshade bind:layerId />
	{:else if layerStyle?.type === 'raster'}
		<RasterLegendEdit bind:layerId bind:metadata bind:tags bind:expanded />
	{/if}
</div>

<style lang="scss">
	.legend-container {
		position: relative;
		min-height: 40px;
	}
</style>
