<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { SwaggerUIBundle } from 'swagger-ui-dist';
	import 'swagger-ui-dist/swagger-ui.css';

	let spec = page.data.spec;

	let swaggerDiv: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (swaggerDiv) {
			SwaggerUIBundle({
				url: spec,
				domNode: swaggerDiv,
				presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset]
			});
		}
	});
</script>

{#if browser}
	<div class="p-4" bind:this={swaggerDiv}></div>
{/if}

<style global lang="scss">
	:global(.version) {
		background-color: hsla(0, 0%, 96%, 0) !important;
	}
</style>
