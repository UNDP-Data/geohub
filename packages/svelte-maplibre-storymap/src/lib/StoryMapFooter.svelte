<script lang="ts">
	import { getContext } from 'svelte';
	import type { StoryMapTemplate } from './interfaces/StoryMapTemplate.js';
	import { STORYMAP_CONFIG_STORE_CONTEXT_KEY, type StoryMapConfigStore } from './stores/index.js';

	export let template: StoryMapTemplate = 'light';

	let config: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
</script>

{#if $config?.footer}
	<div id="footer" class="footer {template}">
		<p>{$config.footer}</p>
	</div>
{/if}

<style lang="scss">
	@import '$lib/css/light/footer.scss';
	@import '$lib/css/dark/footer.scss';
</style>
