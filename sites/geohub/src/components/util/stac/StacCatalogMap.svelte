<script lang="ts">
	import StacCollectionMap from '$components/util/stac/StacCollectionMap.svelte';
	import type { StacCatalog, StacCatalogBreadcrumb } from '$lib/types';
	import { Accordion } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let stacId: string;
	export let url: string;
	export let collectionUrl = '';

	let stacCatalog: StacCatalog;
	let isMetadataExpanded = true;

	const initialiseCatalog = async () => {
		stacCatalog = undefined;
		const res = await fetch(url);
		stacCatalog = await res.json();
	};

	const handleCollectionSelected = (e: { detail: StacCatalogBreadcrumb }) => {
		const data: StacCatalogBreadcrumb = e.detail;
		dispatch('selected', data);
	};

	const dataAddedToMap = (e) => {
		dispatch('dataAdded', e.detail);
	};

	onMount(() => {
		initialiseCatalog();
	});

	$: url, initialiseCatalog();
</script>

{#if stacCatalog}
	<Accordion title="metadata" isExpanded={isMetadataExpanded}>
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
		bind:stacId
		bind:url
		bind:links={stacCatalog.links}
		bind:collectionUrl
		on:selected={handleCollectionSelected}
		on:dataAdded={dataAddedToMap}
	/>
{/if}
