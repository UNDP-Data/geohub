<script lang="ts">
	import { marked } from 'marked';
	import { getContext } from 'svelte';
	import type { StoryMapTemplate } from './interfaces/StoryMapTemplate.js';
	import { STORYMAP_CONFIG_STORE_CONTEXT_KEY, type StoryMapConfigStore } from './stores/index.js';

	export let template: StoryMapTemplate = 'light';
	export let size: 'small' | 'normal' = 'normal';

	let config: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
</script>

{#if $config?.footer}
	<div id="footer" class="footer {template} {size} ">
		<div class="markdown-content content">
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html marked.parse($config.footer)}
		</div>
	</div>
{/if}

<style lang="scss">
	@import '$lib/css/light/footer.scss';
	@import '$lib/css/dark/footer.scss';
</style>
