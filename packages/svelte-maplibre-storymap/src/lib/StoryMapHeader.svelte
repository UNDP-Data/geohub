<script lang="ts">
	import { getContext } from 'svelte';
	import type { StoryMapTemplate } from './interfaces/StoryMapTemplate.js';
	import { STORYMAP_CONFIG_STORE_CONTEXT_KEY, type StoryMapConfigStore } from './stores/index.js';

	export let template: StoryMapTemplate = 'light';

	let config: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
</script>

<div id="header" class="header {template} {$config?.logo ? 'logo' : ''}">
	{#if $config?.logo}
		<img src={$config.logo} alt={$config.logo} />
	{/if}
	{#if $config?.title}
		<h3>{$config.title}</h3>
	{/if}
	{#if $config?.subtitle}
		<p class="subtitle">{$config.subtitle}</p>
	{/if}
	{#if $config?.byline}
		<p class="byline">{$config.byline}</p>
	{/if}
</div>

<style lang="scss">
	@import '$lib/css/light/header.scss';
	@import '$lib/css/dark/header.scss';
</style>
