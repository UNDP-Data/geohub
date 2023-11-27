<script lang="ts">
	import StacCatalogCollections from '$components/util/stac/StacCatalogCollections.svelte';
	import StacCatalogItem from '$components/util/stac/StacCatalogItem.svelte';
	import StacCatalogMap from '$components/util/stac/StacCatalogMap.svelte';
	import { clean, handleEnterKey } from '$lib/helper';
	import type { StacCatalogBreadcrumb } from '$lib/types';
	import { onMount } from 'svelte';

	export let stac: { id: string; url: string; name: string };

	let StacBreadcrumbs: StacCatalogBreadcrumb[];

	onMount(() => {
		initialise();
	});

	const initialise = () => {
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
					<StacCatalogMap bind:url={page.url} on:selected={handleSelectCollection} />
				{:else if page.type === 'Collection'}
					<StacCatalogCollections bind:url={page.url} on:selected={handleSelectChild} />
				{:else if page.type === 'Item'}
					{@const collectionUrls = StacBreadcrumbs.filter((x) => x.type === 'Collection')}
					{@const fistColleciton = collectionUrls[0].url}
					<StacCatalogItem
						bind:stacId={stac.id}
						bind:url={page.url}
						collectionUrl={fistColleciton}
					/>
				{:else}
					error
				{/if}
			</div>
		{/each}
	{/if}
</section>
