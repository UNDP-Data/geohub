<script lang="ts">
	import { page } from '$app/state';
	import DefaultStyleEditor from '$components/pages/data/datasets/DefaultStyleEditor.svelte';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: '/data' },
		{ title: data.feature.properties.name as string, url: `/data/${data.feature.properties.id}` },
		{ title: 'edit default appearance', url: page.url.href }
	]);
</script>

<HeroHeader title="Edit default appearance" bind:breadcrumbs />

<div class="m-6">
	<DefaultStyleEditor feature={data.feature} />
</div>
