<script lang="ts">
	import { ALGORITHM_TAG_KEY } from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
	import StacCollectionMap from '$components/util/stac/StacCollectionMap.svelte';
	import type {
		DatasetFeature,
		StacCatalogBreadcrumb,
		StacCollection,
		StacDataLayer
	} from '$lib/types';
	import { Tabs, type Tab } from '@undp-data/svelte-undp-components';
	import { onMount } from 'svelte';
	import StacCatalogTools from './StacCatalogTools.svelte';

	interface Props {
		stacId: string;
		collectionUrl: string;
		url: string;
		dataset?: DatasetFeature;
		onDataAdded?: (layers: StacDataLayer[]) => void;
		onSelected?: (breadcrumb: StacCatalogBreadcrumb) => void;
	}

	let {
		stacId,
		collectionUrl,
		url,
		dataset,
		onDataAdded = () => {},
		onSelected = () => {}
	}: Props = $props();

	let collection: StacCollection | undefined = $state();

	let tabs: Tab[] = $state([
		{ id: 'catalog', label: 'Explore from catalog' },
		{ id: 'tools', label: 'Tools' }
	]);

	const algorithmTags = dataset?.properties.tags?.filter((t) => t.key === ALGORITHM_TAG_KEY) ?? [];
	if (!(algorithmTags.length > 0)) {
		const getTabsWithoutTool = () => {
			return tabs.filter((t) => t.id !== 'tools');
		};
		tabs = getTabsWithoutTool();
	}

	const getDefaultTab = () => {
		return tabs[0].id;
	};

	let activeTab = $state(getDefaultTab());

	onMount(() => {
		initialise();
	});

	const initialise = async () => {
		collection = undefined;
		collection = await fetchCollection(url);
	};

	const fetchCollection = async (collectionUrl: string) => {
		const res = await fetch(collectionUrl);
		return (await res.json()) as StacCollection;
	};

	$effect(() => {
		if (url !== undefined) {
			initialise();
		}
	});
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
			{stacId}
			{collectionUrl}
			{url}
			links={collection.links}
			{onSelected}
			{onDataAdded}
		/>
	</div>

	<div hidden={activeTab !== 'tools'}>
		<StacCatalogTools {collectionUrl} {collection} {dataset} {onDataAdded} />
	</div>
{/if}
