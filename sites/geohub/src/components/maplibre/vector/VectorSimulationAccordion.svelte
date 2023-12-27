<script lang="ts">
	import VectorParamsPanel from '$components/maplibre/vector/VectorParamsPanel.svelte';
	import Help from '$components/util/Help.svelte';
	import { getLayerSourceUrl, loadArgumentsInDynamicLayers } from '$lib/helper';
	import type { Tag } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let tags: Tag[];
	export let expanded: { [key: string]: boolean };

	let isSimulationLayer = false;

	const init = async () => {
		const isFunction = tags?.find((t) => t.key == 'layertype')?.value === 'function' ?? false;
		if (isFunction) {
			const layerUrl = getLayerSourceUrl($map, layerId) as string;
			const args = await loadArgumentsInDynamicLayers(layerUrl);
			if (args && Object.keys(args).length > 0) {
				expanded = { simulation: true };
				isSimulationLayer = true;
			}
		}
	};

	onMount(() => {
		init();
	});
</script>

{#if expanded && isSimulationLayer}
	<Accordion headerTitle="Simulation" fontSize="medium" bind:isExpanded={expanded['simulation']}>
		<div class="pb-2" slot="content">
			<VectorParamsPanel {layerId} />
		</div>
		<div slot="button">
			<Help>Simulate the dataset dynamically by changing available parameters</Help>
		</div>
	</Accordion>
{/if}
