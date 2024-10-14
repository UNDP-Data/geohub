<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import VectorTableColumn from '$components/pages/map/layers/vector/VectorTableColumn.svelte';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const config: UserConfig = $page.data.config;
	const url = $page.url;

	export let sortby =
		url.searchParams.get('ingestingsortby') ?? config.DataPageIngestingSortingColumn;
	export let sortingorder =
		url.searchParams.get('ingestingsortorder') ?? config.DataPageIngestingSortingOrder;

	const headerCols = [
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
	];

	const handleColumnClick = (e) => {
		const name = e.detail.name;
		const order = e.detail.order;
		if (sortby === name) {
			sortingorder = order;
		}
		sortby = name;

		const apiUrl = new URL($page.url);
		apiUrl.searchParams.set('ingestingsortby', sortby);
		apiUrl.searchParams.set('ingestingsortorder', sortingorder);

		replaceState(apiUrl, '');
		dispatch('sortChanged', {
			sortby,
			sortingorder
		});
	};
</script>

<tr>
	<th class="px-1"></th>
	{#each headerCols as col, index}
		<th class={index === 0 ? 'pl-0' : ''}>
			{#if col.sortingCol}
				<VectorTableColumn
					bind:name={col.name}
					isActive={sortby === col.name}
					on:change={handleColumnClick}
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
