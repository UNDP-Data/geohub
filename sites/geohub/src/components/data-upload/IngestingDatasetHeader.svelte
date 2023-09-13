<script lang="ts">
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

		const apiUrl = new URL(url.toString());
		apiUrl.searchParams.set('ingestingsortby', sortby);
		apiUrl.searchParams.set('ingestingsortorder', sortingorder);
		apiUrl.hash = url.hash;

		history.replaceState({}, null, apiUrl.toString());
		dispatch('sortChanged', {
			sortby,
			sortingorder
		});
	};
</script>

<div class="row columns is-vcentered m-0 is-mobile">
	<div class="column is-9-mobile">
		<p class="is-size-6 has-text-centered has-text-weight-bold">
			<span
				class="icon-text sortable-column hidden-mobile"
				role="button"
				tabindex="0"
				on:click={() => handleColumnClick('name')}
				on:keydown={handleEnterKey}
			>
				{#if sortby === 'name'}
					<span class="icon">
						<i class="fa-solid {sortingorder === 'desc' ? 'fa-sort-up' : 'fa-sort-down'}"></i>
					</span>
				{/if}
				<span> Name </span>
			</span>
			<span class="show-mobile"> Name </span>
		</p>
	</div>
	<div class="column is-2">
		<p class="is-size-6 has-text-centered has-text-weight-bold">Status</p>
	</div>
	<div class="column is-1 hidden-mobile">
		<p class="is-size-6 has-text-centered has-text-weight-bold">
			<span
				class="icon-text sortable-column hidden-mobile"
				role="button"
				tabindex="0"
				on:click={() => handleColumnClick('contentLength')}
				on:keydown={handleEnterKey}
			>
				{#if sortby === 'contentLength'}
					<span class="icon">
						<i class="fa-solid {sortingorder === 'desc' ? 'fa-sort-up' : 'fa-sort-down'}"></i>
					</span>
				{/if}
				<span> Size </span>
			</span>
			<span class="show-mobile"> Size </span>
		</p>
	</div>
	<div class="column is-2 hidden-mobile">
		<p class="is-size-6 has-text-centered has-text-weight-bold">
			<span
				class="icon-text sortable-column hidden-mobile"
				role="button"
				tabindex="0"
				on:click={() => handleColumnClick('createdat')}
				on:keydown={handleEnterKey}
			>
				{#if sortby === 'createdat'}
					<span class="icon">
						<i class="fa-solid {sortingorder === 'desc' ? 'fa-sort-up' : 'fa-sort-down'}"></i>
					</span>
				{/if}
				<span> Uploaded at </span>
			</span>
			<span class="show-mobile"> Uploaded at </span>
		</p>
	</div>
	<div class="column is-1 hidden-mobile">
		<p></p>
	</div>
</div>

<style lang="scss">
	.row {
		border-top: 1px solid gray;
		border-bottom: 1px solid gray;

		.sortable-column {
			cursor: pointer;
		}
	}

	.hidden-mobile {
		display: block;
		@media (max-width: 48em) {
			display: none;
		}
	}

	.show-mobile {
		display: none;
		@media (max-width: 48em) {
			display: block;
		}
	}
</style>
