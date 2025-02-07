<script lang="ts">
	import type { StoryMapConfig } from '$lib/types';
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		StoryMapFooter,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { getContext, onMount } from 'svelte';

	interface Props {
		width?: string;
	}

	let { width = $bindable('100%') }: Props = $props();

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	let template_id: StoryMapTemplate = $state('light');

	onMount(() => {
		template_id = ($configStore as StoryMapConfig).template_id as StoryMapTemplate;
	});
</script>

<div class="footer-overlay is-flex is-align-items-center" style="width: {width};">
	{#key template_id}
		<StoryMapFooter bind:template={template_id} />
	{/key}
</div>

<style lang="scss">
	.footer-overlay {
		position: fixed;
		bottom: 0;
		:global(.footer) {
			max-height: 80vh;
			overflow-y: auto;
		}
	}
</style>
