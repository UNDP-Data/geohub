<script lang="ts">
	import Hillshade from '$components/maplibre/hillshade/Hillshade.svelte';
	import { getValueFromRasterTileUrl } from '$lib/helper';
	import type { Link, RasterAlgorithm, RasterTileMetadata, Tag } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Accordion, Help } from '@undp-data/svelte-undp-components';
	import { type LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import RasterAlgorithms from './RasterAlgorithms.svelte';
	import RasterLegendEdit from './RasterLegendEdit.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];
	export let links: Link[] = [];
	let algorithmId: string = undefined;
	let algorithm: RasterAlgorithm;

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
		algorithmId = (getValueFromRasterTileUrl($map, layerId, 'algorithm') as string) ?? undefined;
		if (algorithmId) {
			getAlgorithm(algorithmId).then((algo) => {
				algorithm = algo;
			});
		}
		layerStyle = $map.getStyle().layers.find((l: LayerSpecification) => l.id === layerId);
	});

	const getAlgorithm = async (id: string) => {
		if (!id) return;
		const algorithmsLink = links.find((l) => l.rel === 'algorithms')?.href;
		const res = await fetch(`${algorithmsLink}/${id}`);
		const algo: RasterAlgorithm = await res.json();
		return algo;
	};
</script>

<div class="legend-container">
	{#if algorithm}
		{#if algorithm.parameters && Object.keys(algorithm.parameters).length > 0}
			{@const title = algorithm.title ?? algorithmId.toUpperCase()}
			<Accordion title="{title} customization" bind:isExpanded={expanded['algorithm']}>
				<div slot="content">
					<RasterAlgorithms
						bind:layerId
						bind:links
						on:change={handleSelectAlgorithm}
						bind:algorithmId
					/>
				</div>
				<div slot="buttons">
					<Help>
						Customize parameters for {title} algorithm
						{#if algorithm.description}
							- {algorithm.description}
						{/if}
					</Help>
				</div>
			</Accordion>
		{/if}
	{/if}

	{#if layerStyle && layerStyle.type === 'hillshade'}
		<Hillshade bind:layerId />
	{:else if layerStyle?.type === 'raster'}
		{#key layerStyle}
			<RasterLegendEdit bind:layerId bind:metadata bind:tags bind:expanded bind:algorithmId />
		{/key}
	{/if}
</div>

<style lang="scss">
	.legend-container {
		position: relative;
		min-height: 40px;
	}
</style>
