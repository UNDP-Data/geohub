<script lang="ts">
	import StacCollectionMap from '$components/util/stac/StacCollectionMap.svelte';
	import type { StacCatalogBreadcrumb, StacCollection } from '$lib/types';
	import { Tabs, type Tab } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, onMount } from 'svelte';
	import StacCatalogDatePicker from './StacCatalogDatePicker.svelte';

	const dispatch = createEventDispatcher();

	export let stacId: string;
	export let collectionUrl: string;
	export let url: string;

	let collections: StacCollection;

	let tabs: Tab[] = [
		{ id: 'catalog', label: 'Catalog' },
		{ id: 'tools', label: 'Tools' }
	];
	let activeTab = tabs[0].id;

	onMount(() => {
		initialise();
	});

	$: url, initialise();

	const initialise = async () => {
		collections = undefined;
		collections = await fetchCollection(url);
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

{#if collections}
	<p class="is-size-6 mb-4">{collections.description}</p>

	<Tabs
		bind:tabs
		bind:activeTab
		isCentered={false}
		isBoxed={false}
		isUppercase={true}
		fontWeight="bold"
	/>

	<div hidden={activeTab !== 'catalog'}>
		<StacCollectionMap
			bind:stacId
			bind:collectionUrl
			bind:url
			bind:links={collections.links}
			on:selected={handleChildSelected}
			on:dataAdded={dataAddedToMap}
		/>
	</div>

	<div hidden={activeTab !== 'tools'}>
		<StacCatalogDatePicker bind:collectionUrl bind:collection={collections} />
	</div>
{/if}
