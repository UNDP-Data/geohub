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

	const handleSortChanged = (e) => {
		const sortby = e.detail.sortby;
		const sortingorder = e.detail.sortingorder;

		if (!(ingestingDatasets && ingestingDatasets.length > 0)) return;

		const sortedDatasets = ingestingDatasets.sort((a, b) => {
			if (a.raw[sortby] > b.raw[sortby]) {
				return sortingorder === 'desc' ? -1 : 1;
			} else if (a.raw[sortby] < b.raw[sortby]) {
				return sortingorder === 'desc' ? 1 : -1;
			} else {
				return 0;
			}
		});
		ingestingDatasets = [...sortedDatasets];
	};
</script>

<IngestingDatasetHeader on:sortChanged={handleSortChanged} />

{#await datasets}
	<div class="align-center my-4">
		<Loader />
	</div>
{:then}
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
