<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import { clean, handleEnterKey } from '$lib/helper';
	import type { StacCatalogBreadcrumb } from '$lib/types';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import StacCatalogCollections from './StacCatalogCollections.svelte';
	import StacCatalogItem from './StacCatalogItem.svelte';
	import StacCatalogMap from './StacCatalogMap.svelte';

	export let data: PageData;
	const stacId = $page.url.searchParams.get('stac');

	let selectedStac = stacId ? data.stacCatalogs.find((s) => s.id === stacId) : data.stacCatalogs[0];

	let StacBreadcrumbs: StacCatalogBreadcrumb[];

	onMount(() => {
		reload();
	});

	const reload = () => {
		initialise();
	};

	const initialise = () => {
		if (!selectedStac) return;

		StacBreadcrumbs = [
			{
				title: clean(selectedStac.id),
				url: selectedStac.url,
				type: 'Catalog'
			}
		];
	};

	const handleSelectChanged = () => {
		const url = $page.url;
		url.searchParams.set('stac', selectedStac.id);
		goto(url, { replaceState: true, noScroll: true, keepFocus: true, invalidateAll: false });
		reload();
	};

	const handleSelectCollection = (e: { detail: StacCatalogBreadcrumb }) => {
		const data = e.detail as StacCatalogBreadcrumb;
		StacBreadcrumbs = [...StacBreadcrumbs, data];
	};

	const handleSelectChild = (e: { detail: StacCatalogBreadcrumb }) => {
		const data = e.detail as StacCatalogBreadcrumb;
		StacBreadcrumbs = [...StacBreadcrumbs, data];
	};

	const handleBreadcrumbClicked = (page: StacCatalogBreadcrumb) => {
		if (StacBreadcrumbs?.length > 0) {
			const pageIndex = StacBreadcrumbs.findIndex((p) => p.title === page.title);
			StacBreadcrumbs = [...StacBreadcrumbs.slice(0, pageIndex + 1)];
		}
	};
</script>

<section class=" p-4">
	<h1 class="title">STAC Catalog Management tools</h1>

	<div class="my-2"><BackToPreviousPage defaultLink="/management/stac" /></div>

	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Select STAC</label>
		<div class="control">
			<div class="select is-link">
				<select bind:value={selectedStac} on:change={handleSelectChanged}>
					{#each data.stacCatalogs as stac}
						<option value={stac}>{stac.name}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	{#if selectedStac}
		{#if StacBreadcrumbs && StacBreadcrumbs.length > 0}
			<nav class="breadcrumb has-text-weight-bold" aria-label="breadcrumbs">
				<ul>
					{#each StacBreadcrumbs as page, index}
						{#if index === StacBreadcrumbs.length - 1}
							<li class="is-active">
								<!-- svelte-ignore a11y-missing-attribute -->
								<a
									aria-current="page"
									data-sveltekit-preload-data="off"
									data-sveltekit-preload-code="off">{page.title}</a
								>
							</li>
						{:else}
							<li>
								<!-- svelte-ignore a11y-missing-attribute -->
								<a
									role="button"
									tabindex="0"
									on:click={() => {
										handleBreadcrumbClicked(page);
									}}
									on:keydown={handleEnterKey}
									data-sveltekit-preload-data="off"
									data-sveltekit-preload-code="off"
								>
									{page.title}
								</a>
							</li>
						{/if}
					{/each}
				</ul>
			</nav>

			{#each StacBreadcrumbs as page, index}
				{@const isLastPage = index === StacBreadcrumbs.length - 1}
				<div hidden={!isLastPage}>
					{#if page.type === 'Catalog'}
						<StacCatalogMap bind:url={page.url} on:selected={handleSelectCollection} />
					{:else if page.type === 'Collection'}
						<StacCatalogCollections bind:url={page.url} on:selected={handleSelectChild} />
					{:else if page.type === 'Item'}
						<StacCatalogItem bind:stacId={selectedStac.id} bind:url={page.url} />
					{:else}
						error
					{/if}
				</div>
			{/each}
		{/if}
	{/if}
</section>
