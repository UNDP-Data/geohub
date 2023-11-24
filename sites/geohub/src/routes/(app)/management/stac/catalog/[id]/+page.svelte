<script lang="ts">
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import StacCatalogExplorer from '../StacCatalogExplorer.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let stac = data.stac;
</script>

<section class=" p-4">
	<div class="my-2"><BackToPreviousPage defaultLink="/management/stac" /></div>

	{#if stac}
		<StacCatalogExplorer bind:stac />
	{/if}
</section>
