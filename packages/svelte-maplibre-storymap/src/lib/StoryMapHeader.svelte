<script lang="ts">
	import { getContext } from 'svelte';
	import type { StoryMapTemplate } from './interfaces/StoryMapTemplate.js';
	import { STORYMAP_CONFIG_STORE_CONTEXT_KEY, type StoryMapConfigStore } from './stores/index.js';

	export let template: StoryMapTemplate = 'light';
	export let size: 'small' | 'normal' = 'normal';

	let config: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
</script>

<div id="header" class="header {template} {$config?.logo ? 'logo' : ''} {size}">
	{#if $config?.logo}
		<img class={size} src={$config.logo} alt={$config.logo} />
	{/if}
	{#if $config?.title}
		<h3 class={size}>{$config.title}</h3>
	{/if}
	{#if $config?.subtitle}
		<p class="subtitle {size}">{$config.subtitle}</p>
	{/if}
	{#if $config?.byline}
		<p class="byline {size}">{$config.byline}</p>
	{/if}
</div>

<style lang="scss">
	@import '$lib/css/light/header.scss';
	@import '$lib/css/dark/header.scss';
</style>
