<script lang="ts">
	import type { IngestingDataset } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import IngestingDatasetHeader from './IngestingDatasetHeader.svelte';
	import IngestingDatasetRow from './IngestingDatasetRow.svelte';

	const dispatch = createEventDispatcher();

	export let datasets: Promise<IngestingDataset[]>;
	let ingestingDatasets: IngestingDataset[];

	$: datasets, updateDatasets();
	const updateDatasets = () => {
		datasets.then((res) => {
			ingestingDatasets = res;
		});
	};
	updateDatasets();

	const handleDataChanged = () => {
		dispatch('change');
	};
</script>

{#await datasets}
	<div class="align-center my-4">
		<Loader />
	</div>
{:then}
	<IngestingDatasetHeader />
	{#each ingestingDatasets as dataset}
		<IngestingDatasetRow bind:dataset on:change={handleDataChanged} />
	{/each}
{/await}

<style lang="scss">
	.align-center {
		width: max-content;
		margin: auto;
	}
</style>
