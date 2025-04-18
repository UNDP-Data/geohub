<script lang="ts">
	import { page } from '$app/state';
	import VectorTableColumn from '$components/pages/map/layers/vector/VectorTableColumn.svelte';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import type { IngestingDataset } from '$lib/types';
	import { Notification } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { onMount, type Snippet } from 'svelte';
	import IngestingDatasetRow from './IngestingDatasetRow.svelte';

	interface Props {
		datasets: IngestingDataset[] | undefined;
		button?: Snippet;
	}

	let { datasets = $bindable(), button }: Props = $props();

	const config: UserConfig = page.data.config;

	let sortby = $state(config.DataPageIngestingSortingColumn);
	let sortingorder = $state(config.DataPageIngestingSortingOrder);

	const headerCols = $state([
		{
			name: 'name',
			title: 'File name',
			sortingCol: true
		},
		{
			name: 'status',
			title: 'Status',
			sortingCol: false
		},
		{
			name: 'contentLength',
			title: 'Size',
			sortingCol: true
		},

		{
			name: 'createdat',
			title: 'Uploaded at',
			sortingCol: true
		}
	]);

	const handleColumnClick = (name: string, order: 'asc' | 'desc') => {
		if (sortby === name) {
			sortingorder = order;
		}
		sortby = name;

		datasets = datasets?.sort((a, b) => {
			if (a.raw[sortby] > b.raw[sortby]) {
				return sortingorder === 'desc' ? -1 : 1;
			} else if (a.raw[sortby] < b.raw[sortby]) {
				return sortingorder === 'desc' ? 1 : -1;
			} else {
				return 0;
			}
		});
	};

	const getIngestingDatasets = async () => {
		datasets = undefined;
		const resIngesting = await fetch(
			`/api/datasets/ingesting?sortby=${sortby}&sortorder=${sortingorder}`
		);
		datasets = await resIngesting.json();
		return datasets;
	};

	onMount(() => {
		getIngestingDatasets();
	});
</script>

<section class="header-content columns is-flex is-flex-wrap-wrap mx-0 pb-4">
	<div class="column is-12-mobile is-2 mt-auto p-0">
		{@render button?.()}
	</div>
	<div
		class="column is-12-mobile is-flex is-align-items-center is-justify-content-flex-end is-flex-wrap-wrap p-0"
	>
		<div class="refresh-button">
			<button
				class="button is-link is-uppercase has-text-weight-bold my-2"
				onclick={getIngestingDatasets}
			>
				<span class="icon">
					<i class="fa-solid fa-rotate"></i>
				</span>
				<span>Refresh</span>
			</button>
		</div>
	</div>
</section>

{#if datasets}
	{#if datasets.length > 0}
		<div class="table-container">
			<table class="table is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th class="px-1"></th>
						{#each headerCols as col, index (col.name)}
							<th class={index === 0 ? 'pl-0' : ''}>
								{#if col.sortingCol}
									<VectorTableColumn
										bind:name={col.name}
										bind:order={sortingorder}
										isActive={sortby === col.name}
										change={handleColumnClick}
									/>
								{:else}
									<p class="has-text-weight-bold">{col.title}</p>
								{/if}
							</th>
						{/each}
						<th>
							<p></p>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each datasets as dataset (datasets.indexOf(dataset))}
						<IngestingDatasetRow {dataset} change={getIngestingDatasets} />
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="m-2">
			<Notification type="info" showCloseButton={false}>No ingesting datasets found</Notification>
		</div>
	{/if}
{:else}
	<div class="is-flex is-justify-content-center my-4">
		<Loader></Loader>
	</div>
{/if}

<style lang="scss">
	.refresh-button {
		margin-left: auto;
	}
</style>
