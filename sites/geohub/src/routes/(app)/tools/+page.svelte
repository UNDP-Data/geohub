<script lang="ts">
	import { page } from '$app/stores';
	import { algorithmCategory } from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
	import Breadcrumbs, { type BreadcrumbPage } from '$components/util/Breadcrumbs.svelte';
	import Notification from '$components/util/Notification.svelte';
	import { Card } from '@undp-data/svelte-undp-design';
	import type { PageData } from './$types';

	export let data: PageData;

	let algorithms = data.algorithms;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'Tools', url: $page.url.href }
	];
</script>

<div class="has-background-light px-6 py-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-5">Tools</p>
</div>

<div class="mx-5 my-6">
	{#if Object.keys(algorithms).length === 0}
		<Notification showCloseButton={false}>No tools registered</Notification>
	{:else}
		<div class="columns is-multiline is-mobile">
			{#each Object.keys(algorithms) as name}
				<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
					<Card
						linkName="Explore datasets"
						url="/data?algorithm={name}"
						tag={algorithmCategory[name.toLowerCase()] ?? 'geohub'}
						title={name.toUpperCase()}
						description=""
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>
