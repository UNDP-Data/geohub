<script lang="ts">
	import { page } from '$app/stores';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import DashboardsExplorer from './DashboardsExplorer.svelte';

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'dashboards', url: $page.url.href }
	];
</script>

<HeroHeader title="Explore dashboards" bind:breadcrumbs />

<DashboardsExplorer />
