<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { handleEnterKey, initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	const tippyTooltip = initTooltipTippy();

	const config: UserConfig = $page.data.config;
	const url = $page.url;

	export let sortby =
		url.searchParams.get('ingestingsortby') ?? config.DataPageIngestingSortingColumn;
	export let sortingorder =
		url.searchParams.get('ingestingsortorder') ?? config.DataPageIngestingSortingOrder;

	const handleColumnClick = (name: string) => {
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

		replaceState(apiUrl, '');
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
				use:tippyTooltip={{
					content: `Click to sort by file name`
				}}
			>
				<span>File name</span>

				<span class="icon">
					{#if sortby === 'name'}
						<span class="material-symbols-outlined sort-icon">
							{#if sortingorder === 'desc'}
								arrow_upward
							{:else}
								arrow_downward
							{/if}
						</span>
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
				use:tippyTooltip={{
					content: `Click to sort by file size`
				}}
			>
				<span>Size</span>

				<span class="icon">
					{#if sortby === 'contentLength'}
						<span class="material-symbols-outlined sort-icon">
							{#if sortingorder === 'desc'}
								arrow_upward
							{:else}
								arrow_downward
							{/if}
						</span>
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
				use:tippyTooltip={{
					content: `Click to sort by uploaded date`
				}}
			>
				<span> Uploaded at </span>

				<span class="icon">
					{#if sortby === 'createdat'}
						<span class="material-symbols-outlined sort-icon">
							{#if sortingorder === 'desc'}
								arrow_upward
							{:else}
								arrow_downward
							{/if}
						</span>
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
