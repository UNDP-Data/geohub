<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import { SwaggerUIBundle } from 'swagger-ui-dist';
	import 'swagger-ui-dist/swagger-ui.css';

	let spec = $page.data.spec;

	let swaggerDiv: HTMLDivElement;

	$: if (swaggerDiv) {
		SwaggerUIBundle({
			url: spec,
			domNode: swaggerDiv,
			presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset]
		});
	}

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'API docs', url: $page.url.href }
	];
</script>

<HeroHeader title="API Documentation" bind:breadcrumbs />

<div class="mx-5 my-4">
	{#if browser}
		<div bind:this={swaggerDiv} />
	{/if}
</div>

<style global lang="scss">
	:global(.version) {
		background-color: hsla(0, 0%, 96%, 0) !important;
	}
</style>
