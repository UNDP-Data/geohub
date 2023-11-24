<script lang="ts">
	import type { StacCatalog } from '$lib/types';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, onMount } from 'svelte';
	import StacCollectionMap from './StacCollectionMap.svelte';

	const dispatch = createEventDispatcher();

	export let url: string;

	let stacCatalog: StacCatalog;
	let isMetadataExpanded = true;

	const initialiseCatalog = async () => {
		const res = await fetch(url);
		stacCatalog = await res.json();
	};

	const handleCollectionSelected = (e) => {
		dispatch('selected', e.detail);
	};

	onMount(() => {
		initialiseCatalog();
	});
</script>

{#if stacCatalog}
	<Accordion headerTitle="metadata" isExpanded={isMetadataExpanded}>
		<div slot="content">
			<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
				<tr><th>STAC version</th><td>{stacCatalog.stac_version}</td></tr>
				<tr><th>Description</th><td>{stacCatalog.description}</td></tr>
				{#if stacCatalog.license}
					<tr><th>License</th><td>{stacCatalog.license}</td></tr>
				{/if}
			</table>
		</div>
	</Accordion>

	<StacCollectionMap
		bind:url
		bind:links={stacCatalog.links}
		on:selected={handleCollectionSelected}
	/>
{/if}
