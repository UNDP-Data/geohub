<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import Breadcrumbs, { type BreadcrumbPage } from '$components/util/Breadcrumbs.svelte';
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

<div class="has-background-light px-6 py-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-4">API Documentation</p>
</div>

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
