<script lang="ts">
	import StacCatalogCollections from '$components/util/stac/StacCatalogCollections.svelte';
	import StacCatalogItem from '$components/util/stac/StacCatalogItem.svelte';
	import StacCatalogMap from '$components/util/stac/StacCatalogMap.svelte';
	import { clean, handleEnterKey } from '$lib/helper';
	import type { Stac, StacCatalogBreadcrumb } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let stacId: string;
	let stac: Stac;

	let StacBreadcrumbs: StacCatalogBreadcrumb[];

	onMount(() => {
		initialise();
	});

	const initialise = async () => {
		const res = await fetch(`/api/stac/${stacId}`);
		stac = (await res.json()) as unknown as Stac;

		StacBreadcrumbs = [
			{
				title: clean(stac.id),
				url: stac.url,
				type: 'Catalog'
			}
		];
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

	const dataAddedToMap = async (e) => {
		dispatch('dataAdded', e.detail);
	};
</script>

<section class=" p-4">
	{#if StacBreadcrumbs && StacBreadcrumbs.length > 0}
		<nav class="breadcrumb has-text-weight-bold is-medium" aria-label="breadcrumbs">
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
					{@const collectionUrls = StacBreadcrumbs.filter((x) => x.type === 'Collection')}
					{@const fistColleciton = collectionUrls.length > 0 ? collectionUrls[0]?.url : ''}
					<StacCatalogMap
						bind:stacId={stac.id}
						bind:url={page.url}
						collectionUrl={fistColleciton}
						on:selected={handleSelectCollection}
						on:dataAdded={dataAddedToMap}
					/>
				{:else if page.type === 'Collection'}
					{@const collectionUrls = StacBreadcrumbs.filter((x) => x.type === 'Collection')}
					{@const fistColleciton = collectionUrls[0].url}
					<StacCatalogCollections
						bind:stacId={stac.id}
						collectionUrl={fistColleciton}
						bind:url={page.url}
						on:selected={handleSelectChild}
						on:dataAdded={dataAddedToMap}
					/>
				{:else if page.type === 'Item'}
					{@const collectionUrls = StacBreadcrumbs.filter((x) => x.type === 'Collection')}
					{@const fistColleciton = collectionUrls[0].url}
					<StacCatalogItem
						bind:stacId={stac.id}
						bind:url={page.url}
						collectionUrl={fistColleciton}
						on:dataAdded={dataAddedToMap}
					/>
				{:else}
					error
				{/if}
			</div>
		{/each}
	{:else}
		<div class="is-flex is-justify-content-center"><Loader /></div>
	{/if}
</section>
