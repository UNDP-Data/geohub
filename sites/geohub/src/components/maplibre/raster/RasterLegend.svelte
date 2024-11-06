<script lang="ts">
	import { getValueFromRasterTileUrl } from '$lib/helper';
	import type { Link, RasterAlgorithm, RasterTileMetadata, Tag } from '$lib/types';
	import {
		Accordion,
		Help,
		HillshadeAccentColor,
		HillshadeExaggeration,
		HillshadeHighlightColor,
		HillshadeIlluminationDirection,
		HillshadeShadowColor,
		MAPSTORE_CONTEXT_KEY,
		type MapStore
	} from '@undp-data/svelte-undp-components';
	import { type LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import RasterAlgorithms from './RasterAlgorithms.svelte';
	import RasterLegendEdit from './RasterLegendEdit.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];
	export let links: Link[] = [];
	let algorithmId: string | undefined = undefined;
	let algorithm: RasterAlgorithm;
	let layerStyle: LayerSpecification | undefined;

	const handleSelectAlgorithm = () => {
		layerStyle = $map.getStyle().layers.find((l: LayerSpecification) => l.id === layerId);
	};

	let expanded: { [key: string]: boolean } = {};
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

	onMount(() => {
		algorithmId = (getValueFromRasterTileUrl($map, layerId, 'algorithm') as string) ?? undefined;
		if (algorithmId) {
			getAlgorithm(algorithmId).then((algo) => {
				algorithm = algo;
			});
		}
		layerStyle = $map.getStyle().layers.find((l: LayerSpecification) => l.id === layerId);
		const isHillShade = layerStyle && layerStyle.type === 'hillshade' ? true : false;
		if (!isHillShade) {
			expanded = { color: true };
		} else {
			expanded = { 'hillshade-accent-color': true };
		}
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
		<Accordion title="Hillshade accent color" bind:isExpanded={expanded['hillshade-accent-color']}>
			<div class="pb-2" slot="content">
				<HillshadeAccentColor {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					Change the shading color used to accentuate rugged terrain like sharp cliffs and gorges.
				</Help>
			</div>
		</Accordion>
		<Accordion title="Hillshade exaggeration" bind:isExpanded={expanded['hillshade-exaggeration']}>
			<div class="pb-2" slot="content">
				<HillshadeExaggeration {layerId} />
			</div>
			<div slot="buttons">
				<Help>Change the Intensity of the hillshade.</Help>
			</div>
		</Accordion>
		<Accordion
			title="Hillshade highlight color"
			bind:isExpanded={expanded['hillshade-highlight-color']}
		>
			<div class="pb-2" slot="content">
				<HillshadeHighlightColor {layerId} />
			</div>
			<div slot="buttons">
				<Help>Change the shading color of areas that faces towards the light source.</Help>
			</div>
		</Accordion>
		<Accordion
			title="Hillshade illumination direction"
			bind:isExpanded={expanded['hillshade-illumination-direction']}
		>
			<div class="pb-2" slot="content">
				<HillshadeIlluminationDirection {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					The direction of the light source used to generate the hillshading with 0 as the top of
					the viewport
				</Help>
			</div>
		</Accordion>
		<Accordion title="Hillshade shadow color" bind:isExpanded={expanded['hillshade-shadow-color']}>
			<div class="pb-2" slot="content">
				<HillshadeShadowColor {layerId} />
			</div>
			<div slot="buttons">
				<Help>Change the shading color of areas that face away from the light source.</Help>
			</div>
		</Accordion>
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
