<script lang="ts">
	import StacCatalogCollections from '$components/util/stac/StacCatalogCollections.svelte';
	import StacCatalogItem from '$components/util/stac/StacCatalogItem.svelte';
	import StacCatalogMap from '$components/util/stac/StacCatalogMap.svelte';
	import type { DatasetFeature, Stac, StacCatalogBreadcrumb, StacDataLayer } from '$lib/types';
	import { Breadcrumbs, clean } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { onMount } from 'svelte';

	interface Props {
		stacId: string;
		dataset?: DatasetFeature;
		onDataAdded?: (layers: StacDataLayer[]) => void;
		onBreadcrumbSelected?: (data: StacCatalogBreadcrumb) => void;
	}

	let {
		stacId = $bindable(),
		dataset = $bindable(undefined),
		onDataAdded = () => {},
		onBreadcrumbSelected = () => {}
	}: Props = $props();
	let stac: Stac | undefined = $state();

	let StacBreadcrumbs: StacCatalogBreadcrumb[] | undefined = $state();

	onMount(() => {
		initialise();
	});

	const initialise = async () => {
		const res = await fetch(`/api/stac/${stacId}`);
		stac = await res.json();

		const collectionId = dataset?.properties.tags.find((t) => t.key === 'collection')?.value;
		if (collectionId) {
			const page: StacCatalogBreadcrumb = {
				title: clean(dataset.properties.name),
				dataUrl: dataset.properties.url,
				type: 'Collection'
			};
			StacBreadcrumbs = [page];
		} else if (stac) {
			const page: StacCatalogBreadcrumb = {
				title: clean(stac.id),
				dataUrl: stac.url,
				type: 'Catalog'
			};
			StacBreadcrumbs = [page];
		}
		if (onBreadcrumbSelected && StacBreadcrumbs) onBreadcrumbSelected(StacBreadcrumbs[0]);
	};

	const handleSelectCollection = (e: { detail: StacCatalogBreadcrumb }) => {
		const data = e.detail as StacCatalogBreadcrumb;
		StacBreadcrumbs = StacBreadcrumbs ? [...StacBreadcrumbs, data] : [data];
		if (onBreadcrumbSelected) onBreadcrumbSelected(data);
	};

	const handleSelectChild = (e: { detail: StacCatalogBreadcrumb }) => {
		const data = e.detail as StacCatalogBreadcrumb;
		StacBreadcrumbs = StacBreadcrumbs ? [...StacBreadcrumbs, data] : [data];
		if (onBreadcrumbSelected) onBreadcrumbSelected(data);
	};

	const handleBreadcrumbClicked = (e: { detail: StacCatalogBreadcrumb }) => {
		const page: StacCatalogBreadcrumb = e.detail;
		if (StacBreadcrumbs && StacBreadcrumbs?.length > 0) {
			const pageIndex = StacBreadcrumbs.findIndex((p) => p.title === page.title);
			StacBreadcrumbs = [...StacBreadcrumbs.slice(0, pageIndex + 1)];
			if (onBreadcrumbSelected) onBreadcrumbSelected(page);
		}
	};

	const dataAddedToMap = async (e: { detail: { layers: StacDataLayer[] } }) => {
		if (onDataAdded) onDataAdded(e.detail.layers);
	};
</script>

<section class=" p-4">
	{#if StacBreadcrumbs && StacBreadcrumbs.length > 0}
		<Breadcrumbs bind:pages={StacBreadcrumbs} size="small" on:click={handleBreadcrumbClicked} />

		{#each StacBreadcrumbs as page, index}
			{@const isLastPage = index === StacBreadcrumbs.length - 1}
			<div hidden={!isLastPage}>
				{#if page.type === 'Catalog'}
					{@const collectionUrls = StacBreadcrumbs.filter((x) => x.type === 'Collection')}
					{@const fistColleciton = collectionUrls.length > 0 ? collectionUrls[0]?.dataUrl : ''}
					<StacCatalogMap
						bind:stacId={stac.id}
						bind:url={page.dataUrl}
						collectionUrl={fistColleciton}
						on:selected={handleSelectCollection}
						on:dataAdded={dataAddedToMap}
					/>
				{:else if page.type === 'Collection'}
					{@const collectionUrls = StacBreadcrumbs.filter((x) => x.type === 'Collection')}
					{@const fistColleciton = collectionUrls[0].dataUrl}
					<StacCatalogCollections
						bind:stacId={stac.id}
						collectionUrl={fistColleciton}
						bind:url={page.dataUrl}
						on:selected={handleSelectChild}
						on:dataAdded={dataAddedToMap}
						bind:dataset
					/>
				{:else if page.type === 'Item'}
					{@const collectionUrls = StacBreadcrumbs.filter((x) =>
						['Collection', 'Item'].includes(x.type)
					)}
					{@const fistColleciton = collectionUrls[0].dataUrl}
					<StacCatalogItem
						bind:stacId={stac.id}
						bind:url={page.dataUrl}
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
