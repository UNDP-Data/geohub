<script lang="ts">
	import { marked } from 'marked';
	import { getContext } from 'svelte';
	import type { StoryMapTemplate } from './interfaces/StoryMapTemplate';
	import { STORYMAP_CONFIG_STORE_CONTEXT_KEY, type StoryMapConfigStore } from './stores';

	interface Props {
		template?: StoryMapTemplate;
		size?: 'small' | 'normal';
		height?: number;
	}

	let {
		template = $bindable('light'),
		size = $bindable('normal'),
		height = $bindable(0)
	}: Props = $props();

	let config: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
</script>

{#if $config?.footer}
	<div id="footer" class="footer {template} {size} " bind:clientHeight={height}>
		<div class="markdown-content content">
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html marked.parse($config.footer)}
		</div>
	</div>
{/if}

<style lang="scss">
	@import './css/light/footer.scss';
	@import './css/dark/footer.scss';
</style>
