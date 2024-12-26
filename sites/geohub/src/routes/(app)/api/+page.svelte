<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import { SwaggerUIBundle } from 'swagger-ui-dist';
	import 'swagger-ui-dist/swagger-ui.css';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let swaggerDiv: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (swaggerDiv) {
			SwaggerUIBundle({
				url: data.spec,
				domNode: swaggerDiv,
				presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset]
			});
		}
	});

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'API docs', url: page.url.href }
	]);
</script>

<HeroHeader title="API Documentation" bind:breadcrumbs />

<div class="mx-5 my-4">
	{#if browser}
		<div bind:this={swaggerDiv}></div>
	{/if}
</div>

<style global lang="scss">
	:global(.version) {
		background-color: hsla(0, 0%, 96%, 0) !important;
	}
</style>
