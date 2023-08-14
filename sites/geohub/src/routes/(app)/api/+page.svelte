<script lang="ts">
	import { page } from '$app/stores';
	import { SwaggerUIBundle } from 'swagger-ui-dist';
	import 'swagger-ui-dist/swagger-ui.css';

	let title = $page.data.title;
	let spec = $page.data.spec;

	let swaggerDiv: HTMLDivElement;

	$: if (swaggerDiv) {
		SwaggerUIBundle({
			url: spec,
			domNode: swaggerDiv,
			presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset]
		});
	}

	let content = 'API Specification';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="/api/og?content={content}" />
</svelte:head>

<div class="p-4" bind:this={swaggerDiv} />

<style global lang="scss">
	:global(.version) {
		background-color: hsla(0, 0%, 96%, 0) !important;
	}
</style>
