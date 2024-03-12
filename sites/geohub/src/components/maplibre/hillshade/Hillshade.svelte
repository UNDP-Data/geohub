<script lang="ts">
	import HillshadeAccentColor from '$components/maplibre/hillshade/HillshadeAccentColor.svelte';
	import HillshadeExaggeration from '$components/maplibre/hillshade/HillshadeExaggeration.svelte';
	import HillshadeHighlightColor from '$components/maplibre/hillshade/HillshadeHighlightColor.svelte';
	import HillshadeIlluminationDirection from '$components/maplibre/hillshade/HillshadeIlluminationDirection.svelte';
	import HillshadeShadowColorsvelte from '$components/maplibre/hillshade/HillshadeShadowColor.svelte';
	import { loadMap } from '$lib/helper';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Accordion, Help } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	let expanded: { [key: string]: boolean } = { 'hillshade-accent-color': true };
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

	const initMap = async () => {
		return loadMap($map);
	};
</script>

{#await initMap()}
	<div class="is-flex is-justify-content-center p-2">
		<Loader size="small" />
	</div>
{:then isInit}
	{#if isInit}
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
				<HillshadeShadowColorsvelte {layerId} />
			</div>
			<div slot="buttons">
				<Help>Change the shading color of areas that face away from the light source.</Help>
			</div>
		</Accordion>
	{/if}
{/await}
