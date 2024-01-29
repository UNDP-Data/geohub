<script lang="ts">
	import Accordion from '$components/util/Accordion.svelte';
	import Help from '$components/util/Help.svelte';
	import { loadMap } from '$lib/helper';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';
	import HillshadeAccentColor from './HillshadeAccentColor.svelte';
	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	let expanded: { [key: string]: boolean } = { 'hillshade-acent-color': true };
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
		<Accordion title="Hillshade accent color" bind:isExpanded={expanded['hillshade-acent-color']}>
			<div class="pb-2" slot="content">
				<HillshadeAccentColor {layerId} />
			</div>
			<div slot="buttons">
				<Help
					>Change the shading color used to accentuate rugged terrain like sharp cliffs and gorges.</Help
				>
			</div>
		</Accordion>
	{/if}
{/await}
