<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import Notification from '$components/util/Notification.svelte';
	import type { IngestingDataset } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import DataUploadButton from './DataUploadButton.svelte';
	import IngestingDatasetHeader from './IngestingDatasetHeader.svelte';
	import IngestingDatasetRow from './IngestingDatasetRow.svelte';

	export let datasets: IngestingDataset[];

	const handleDataChanged = async () => {
		datasets = undefined;
		await invalidate('data:ingestingDatasets');
		datasets = $page.data.ingestingDatasets;
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

<div class="pb-4 is-flex">
	<DataUploadButton />

	<div class="refresh-button">
		<button class="button is-link my-2" on:click={handleDataChanged}>
			<span class="icon">
				<i class="fa-solid fa-rotate" />
			</span>
			<span>Refresh</span>
		</button>
	</div>
</div>

<IngestingDatasetHeader on:sortChanged={handleSortChanged} />

{#if datasets}
	{#if datasets.length > 0}
		{#each datasets as dataset}
			<IngestingDatasetRow bind:dataset on:change={handleDataChanged} />
		{/each}
	{:else}
		<div class="m-2">
			<Notification type="info" showCloseButton={false}>No ingesting datasets found</Notification>
		</div>
	{/if}
{:else}
	<div class="is-flex is-justify-content-center my-4">
		<Loader />
	</div>
{/if}

<style lang="scss">
	.refresh-button {
		margin-left: auto;
	}
</style>
