<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { handleEnterKey } from '$lib/helper';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const config: UserConfig = $page.data.config;
	const url = $page.url;

	export let sortby =
		url.searchParams.get('ingestingsortby') ?? config.DataPageIngestingSortingColumn;
	export let sortingorder =
		url.searchParams.get('ingestingsortorder') ?? config.DataPageIngestingSortingOrder;

	const handleColumnClick = async (name: string) => {
		const clickSameColumn = sortby === name;

		sortby = name;

		if (clickSameColumn) {
			if (sortingorder === 'desc') {
				sortingorder = 'asc';
			} else {
				sortingorder = 'desc';
			}
		} else {
			sortingorder = 'desc';
		}

		const apiUrl = new URL($page.url);
		apiUrl.searchParams.set('ingestingsortby', sortby);
		apiUrl.searchParams.set('ingestingsortorder', sortingorder);

		await goto(apiUrl, {
			invalidateAll: false,
			replaceState: true
		});
		dispatch('sortChanged', {
			sortby,
			sortingorder
		});
	};
</script>

<tr>
	<th class="px-1"></th>
	<th class="pl-0">
		<p class="is-size-6 sortable-column">
			<span
				class="icon-text"
				role="button"
				tabindex="0"
				on:click={() => handleColumnClick('name')}
				on:keydown={handleEnterKey}
			>
				<span class={sortby === 'name' ? 'has-text-primary' : ''}>File name</span>

				<span class="icon">
					{#if sortby === 'name'}
						<i
							class="fa-solid {sortingorder === 'desc'
								? 'fa-sort-up'
								: 'fa-sort-down'} has-text-primary"
						></i>
					{:else}
						<i class="fa-solid fa-sort"></i>
					{/if}
				</span>
			</span>
		</p>
	</th>
	<th>
		<p class="is-size-6">Status</p>
	</th>
	<th>
		<p class="is-size-6 sortable-column">
			<span
				class="icon-text"
				role="button"
				tabindex="0"
				on:click={() => handleColumnClick('contentLength')}
				on:keydown={handleEnterKey}
			>
				<span class={sortby === 'contentLength' ? 'has-text-primary' : ''}>Size</span>

				<span class="icon">
					{#if sortby === 'contentLength'}
						<i
							class="fa-solid {sortingorder === 'desc'
								? 'fa-sort-up'
								: 'fa-sort-down'} has-text-primary"
						></i>
					{:else}
						<i class="fa-solid fa-sort"></i>
					{/if}
				</span>
			</span>
		</p>
	</th>
	<th>
		<p class="is-size-6 sortable-column">
			<span
				class="icon-text"
				role="button"
				tabindex="0"
				on:click={() => handleColumnClick('createdat')}
				on:keydown={handleEnterKey}
			>
				<span class={sortby === 'createdat' ? 'has-text-primary' : ''}> Uploaded at </span>

				<span class="icon">
					{#if sortby === 'createdat'}
						<i
							class="fa-solid {sortingorder === 'desc'
								? 'fa-sort-up'
								: 'fa-sort-down'} has-text-primary"
						></i>
					{:else}
						<i class="fa-solid fa-sort"></i>
					{/if}
				</span>
			</span>
		</p>
	</th>
	<th>
		<p></p>
	</th>
</tr>

<style lang="scss">
	.sortable-column {
		cursor: pointer;
	}
</style>
