<script lang="ts">
	import { page } from '$app/stores';
	import DefaultStyleEditor from '$components/pages/data/datasets/DefaultStyleEditor.svelte';
	import Breadcrumbs, { type BreadcrumbPage } from '$components/util/Breadcrumbs.svelte';
	import type { DatasetFeature } from '$lib/types';
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

<div class="has-background-light px-6 py-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-5 is-capitalized">Edit default appearance</p>
</div>

<div class="mx-6 my-4">
	<DefaultStyleEditor bind:feature />
</div>
