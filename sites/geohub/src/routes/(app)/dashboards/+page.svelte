<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import DashboardContents from '$components/pages/home/DashboardContents.svelte';
	import { Breadcrumbs, type BreadcrumbPage } from '@undp-data/svelte-undp-components';

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'dashboards', url: $page.url.href }
	];
</script>

<div class="has-background-light px-6 py-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-5">Explore dashboards</p>
</div>

{#if browser}
	<div class="m-6">
		<DashboardContents />
	</div>
{/if}
