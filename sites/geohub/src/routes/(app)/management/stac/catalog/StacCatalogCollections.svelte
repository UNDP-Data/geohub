<script lang="ts">
	import type { StacCollection } from '$lib/types';
	import { createEventDispatcher, onMount } from 'svelte';
	import StacCollectionMap from './StacCollectionMap.svelte';

	const dispatch = createEventDispatcher();

	export let url: string;

	let collections: StacCollection;

	onMount(() => {
		initialise();
	});

	const initialise = async () => {
		collections = await fetchCollection(url);
	};

	const fetchCollection = async (collectionUrl: string) => {
		const res = await fetch(collectionUrl);
		return (await res.json()) as StacCollection;
	};

	const handleChildSelected = (e) => {
		dispatch('selected', e.detail);
	};
</script>

{#if collections}
	<p class="is-size-6 mb-4">{collections.description}</p>

	<StacCollectionMap bind:url bind:links={collections.links} on:selected={handleChildSelected} />
{/if}
