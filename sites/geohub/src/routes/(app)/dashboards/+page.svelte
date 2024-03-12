<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import DashboardContents from '$components/pages/home/DashboardContents.svelte';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'dashboards', url: $page.url.href }
	];
</script>

<HeroHeader title="Explore dashboards" bind:breadcrumbs />

{#if browser}
	<div class="m-6">
		<DashboardContents />
	</div>
{/if}
