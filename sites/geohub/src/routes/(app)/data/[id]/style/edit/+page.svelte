<script lang="ts">
	import { page } from '$app/stores';
	import DefaultStyleEditor from '$components/pages/data/datasets/DefaultStyleEditor.svelte';
	import type { DatasetFeature } from '$lib/types';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import type { PageData } from './$types';

	export let data: PageData;

	let feature: DatasetFeature = data.feature;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: '/data' },
		{ title: feature.properties.name, url: `/data/${feature.properties.id}` },
		{ title: 'edit default appearance', url: $page.url.href }
	];
</script>

<HeroHeader title="Edit default appearance" bind:breadcrumbs />

<div class="m-6">
	<DefaultStyleEditor bind:feature />
</div>
