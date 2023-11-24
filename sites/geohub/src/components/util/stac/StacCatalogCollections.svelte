<script lang="ts">
	import StacCollectionMap from '$components/util/stac/StacCollectionMap.svelte';
	import type { StacCatalogBreadcrumb, StacCollection } from '$lib/types';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let url: string;

	let collections: StacCollection;

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
</script>

{#if collections}
	<p class="is-size-6 mb-4">{collections.description}</p>

	<StacCollectionMap bind:url bind:links={collections.links} on:selected={handleChildSelected} />
{/if}
