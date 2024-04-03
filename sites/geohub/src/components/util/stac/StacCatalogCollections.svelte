<script lang="ts">
	import { ALGORITHM_TAG_KEY } from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
	import StacCollectionMap from '$components/util/stac/StacCollectionMap.svelte';
	import type { DatasetFeature, StacCatalogBreadcrumb, StacCollection } from '$lib/types';
	import { Tabs, type Tab } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, onMount } from 'svelte';
	import StacCatalogTools from './StacCatalogTools.svelte';

	const dispatch = createEventDispatcher();

	export let stacId: string;
	export let collectionUrl: string;
	export let url: string;
	export let dataset: DatasetFeature = undefined;

	let collection: StacCollection;

	let tabs: Tab[] = [{ id: 'catalog', label: 'Explore from catalog' }];

	const algorithmTags = dataset?.properties.tags?.filter((t) => t.key === ALGORITHM_TAG_KEY) ?? [];
	if (algorithmTags.length > 0) {
		tabs.push({ id: 'tools', label: 'Tools' });
	}

	let activeTab = tabs[0].id;

	onMount(() => {
		initialise();
	});

	$: url, initialise();

	const initialise = async () => {
		collection = undefined;
		collection = await fetchCollection(url);
	};

	const fetchCollection = async (collectionUrl: string) => {
		const res = await fetch(collectionUrl);
		return (await res.json()) as StacCollection;
	};

	const handleChildSelected = (e: { detail: StacCatalogBreadcrumb }) => {
		const data: StacCatalogBreadcrumb = e.detail;
		dispatch('selected', data);
	};

	const dataAddedToMap = (e) => {
		dispatch('dataAdded', e.detail);
	};
</script>

{#if collection}
	<p class="is-size-6 mb-4">{collection.description}</p>

	{#if algorithmTags.length > 0}
		<Tabs
			bind:tabs
			bind:activeTab
			isCentered={false}
			isBoxed={false}
			isUppercase={true}
			fontWeight="bold"
		/>
	{/if}

	<div hidden={activeTab !== 'catalog'}>
		<StacCollectionMap
			bind:stacId
			bind:collectionUrl
			bind:url
			bind:links={collection.links}
			on:selected={handleChildSelected}
			on:dataAdded={dataAddedToMap}
		/>
	</div>

	<div hidden={activeTab !== 'tools'}>
		<StacCatalogTools
			bind:collectionUrl
			bind:collection
			bind:dataset
			on:dataAdded={dataAddedToMap}
		/>
	</div>
{/if}
