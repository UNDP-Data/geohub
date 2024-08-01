<script lang="ts">
	import { getContext } from 'svelte';
	import type { StoryMapTemplate } from './interfaces/StoryMapTemplate.js';
	import { STORYMAP_CONFIG_STORE_CONTEXT_KEY, type StoryMapConfigStore } from './stores/index.js';

	export let template: StoryMapTemplate = 'light';

	let config: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
</script>

<div class="footer {template}">
	{#if $config?.footer}
		<p>{$config.footer}</p>
	{/if}
</div>

<style lang="scss">
	@import '$lib/css/light/footer.scss';
	@import '$lib/css/dark/footer.scss';
</style>
