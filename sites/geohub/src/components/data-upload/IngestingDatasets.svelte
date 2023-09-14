<script lang="ts">
	import type { IngestingDataset } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import IngestingDatasetHeader from './IngestingDatasetHeader.svelte';
	import IngestingDatasetRow from './IngestingDatasetRow.svelte';

	const dispatch = createEventDispatcher();

	export let datasets: IngestingDataset[];

	const handleDataChanged = () => {
		dispatch('change');
	};

	const handleSortChanged = (e) => {
		const sortby = e.detail.sortby;
		const sortingorder = e.detail.sortingorder;

		if (!(datasets && datasets.length > 0)) return;

		const sortedDatasets = datasets.sort((a, b) => {
			if (a.raw[sortby] > b.raw[sortby]) {
				return sortingorder === 'desc' ? -1 : 1;
			} else if (a.raw[sortby] < b.raw[sortby]) {
				return sortingorder === 'desc' ? 1 : -1;
			} else {
				return 0;
			}
		});
		datasets = [...sortedDatasets];
	};
</script>

<IngestingDatasetHeader on:sortChanged={handleSortChanged} />

{#each datasets as data}
	{#key data}
		<IngestingDatasetRow dataset={data} on:change={handleDataChanged} />
	{/key}
{/each}
