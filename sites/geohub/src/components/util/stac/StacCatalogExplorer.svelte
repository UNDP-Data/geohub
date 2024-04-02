<script lang="ts">
	import StacCatalogCollections from '$components/util/stac/StacCatalogCollections.svelte';
	import StacCatalogItem from '$components/util/stac/StacCatalogItem.svelte';
	import StacCatalogMap from '$components/util/stac/StacCatalogMap.svelte';
	import type { DatasetFeature, Stac, StacCatalogBreadcrumb } from '$lib/types';
	import { clean, handleEnterKey } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let stacId: string;
	export let dataset: DatasetFeature = undefined;
	let stac: Stac;

	let StacBreadcrumbs: StacCatalogBreadcrumb[];

	onMount(() => {
		initialise();
	});

	const initialise = async () => {
		const res = await fetch(`/api/stac/${stacId}`);
		stac = await res.json();

		const collectionId = dataset?.properties.tags.find((t) => t.key === 'collection').value;
		if (collectionId) {
			const page: StacCatalogBreadcrumb = {
				title: clean(dataset.properties.name),
				url: dataset.properties.url,
				type: 'Collection'
			};
			StacBreadcrumbs = [page];
		} else {
			const page: StacCatalogBreadcrumb = {
				title: clean(stac.id),
				url: stac.url,
				type: 'Catalog'
			};
			StacBreadcrumbs = [page];
		}

		dispatch('breadcrumbSelected', StacBreadcrumbs[0]);
	};

	const handleSelectCollection = (e: { detail: StacCatalogBreadcrumb }) => {
		const data = e.detail as StacCatalogBreadcrumb;
		StacBreadcrumbs = [...StacBreadcrumbs, data];
		dispatch('breadcrumbSelected', data);
	};

	const handleSelectChild = (e: { detail: StacCatalogBreadcrumb }) => {
		const data = e.detail as StacCatalogBreadcrumb;
		StacBreadcrumbs = [...StacBreadcrumbs, data];
		dispatch('breadcrumbSelected', data);
	};

	const handleBreadcrumbClicked = (page: StacCatalogBreadcrumb) => {
		if (StacBreadcrumbs?.length > 0) {
			const pageIndex = StacBreadcrumbs.findIndex((p) => p.title === page.title);
			StacBreadcrumbs = [...StacBreadcrumbs.slice(0, pageIndex + 1)];
			dispatch('breadcrumbSelected', page);
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
