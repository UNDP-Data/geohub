<script lang="ts">
	import StacCollectionMap from '$components/util/stac/StacCollectionMap.svelte';
	import type { StacCatalog, StacCatalogBreadcrumb, StacDataLayer } from '$lib/types';
	import { Accordion } from '@undp-data/svelte-undp-components';
	import { onMount } from 'svelte';

	interface Props {
		stacId: string;
		url: string;
		collectionUrl?: string;
		onDataAdded?: (layers: StacDataLayer[]) => void;
		onSelected?: (breadcrumb: StacCatalogBreadcrumb) => void;
	}

	let {
		stacId,
		url,
		collectionUrl = '',
		onDataAdded = () => {},
		onSelected = () => {}
	}: Props = $props();

	let stacCatalog: StacCatalog | undefined = $state();
	let isMetadataExpanded = true;

	const initialiseCatalog = async () => {
		stacCatalog = undefined;
		const res = await fetch(url);
		stacCatalog = await res.json();
	};

	onMount(() => {
		initialiseCatalog();
	});

	$effect(() => {
		if (url !== undefined) {
			initialiseCatalog();
		}
	});
</script>

{#if stacCatalog}
	<Accordion title="metadata" isExpanded={isMetadataExpanded}>
		{#snippet content()}
			<div>
				<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
					<tbody>
						<tr><th>STAC version</th><td>{stacCatalog.stac_version}</td></tr>
						<tr><th>Description</th><td>{stacCatalog.description}</td></tr>
						{#if stacCatalog.license}
							<tr><th>License</th><td>{stacCatalog.license}</td></tr>
						{/if}
					</tbody>
				</table>
			</div>
		{/snippet}
	</Accordion>

	<StacCollectionMap
		{stacId}
		{url}
		links={stacCatalog.links}
		{collectionUrl}
		{onSelected}
		{onDataAdded}
	/>
{/if}
