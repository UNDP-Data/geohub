<script lang="ts">
	import type { StoryMapChapterType, StoryMapTemplate } from '$lib/interfaces';
	import { marked } from 'marked';
	import { getContext } from 'svelte';
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from './stores/storymapConfig';

	interface Props {
		chapter: StoryMapChapterType;
		activeId?: string;
		template?: StoryMapTemplate;
		size?: 'small' | 'normal';
	}

	let {
		chapter = $bindable(),
		activeId = $bindable(''),
		template = $bindable('light'),
		size = $bindable('normal')
	}: Props = $props();

	// stores should be set at the parent component
	let config: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	let isLast = $derived($config.chapters[$config.chapters.length - 1]?.id === chapter.id);
</script>

<section
	id={chapter.id}
	class="{template} step {chapter.alignment ?? 'center'} {chapter.hidden
		? 'hidden'
		: ''} {size} {isLast ? 'last' : ''}"
>
	<div
		class="card-content {activeId === chapter.id ? 'active' : ''}  {size}"
		style="{chapter.mapInteractive ? 'pointer-events:none;' : ''} {chapter?.cardHidden === true
			? 'visibility: hidden;'
			: ''} "
	>
		{#if chapter.title}
			<h6 class={size}>{chapter.title}</h6>
		{/if}

		<div class="chapter-contents {size}">
			{#if chapter.description}
				<div class="markdown-content content">
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html marked.parse(chapter.description)}
				</div>
			{/if}
		</div>
		{#if chapter.image}
			<div class="chapter-image {size}">
				<img src={chapter.image} alt="{chapter.title} image" />
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@import './css/light/chapter.scss';
	@import './css/dark/chapter.scss';
</style>
