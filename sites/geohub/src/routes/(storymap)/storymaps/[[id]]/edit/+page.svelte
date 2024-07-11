<script lang="ts">
	import StorymapChapterMiniPreview from '$components/pages/storymap/StorymapChapterMiniPreview.svelte';
	import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import { getContext } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);
	let innerHeight: number;
	let editorHeaderHeight: number;
	let newslideButtonHeight: number;
	$: containerHeight = innerHeight - $headerHeightStore;
	$: editorContentHeight = containerHeight - editorHeaderHeight;
	$: slidePreviewHeight = editorContentHeight - newslideButtonHeight;

	let storymap: StoryMapConfig = data.storymap;

	let activeChapter: StoryMapChapter;

	const getTitle = () => {
		return storymap ? storymap.title : 'new storymap';
	};

	const handleChapterClicked = (chapter: unknown) => {
		activeChapter = chapter as StoryMapChapter;
	};
</script>

<svelte:window bind:innerHeight />

{#if storymap}
	<div class="editor-container" style="height: {containerHeight}px;">
		<div class="header p-4" bind:clientHeight={editorHeaderHeight}>
			<div class="is-flex is-align-items-center">
				<p class="storymap-title">{getTitle()}</p>
				<button class="button is-small title-edit-button">
					<span class="icon is-small">
						<span class="material-icons-outlined"> edit </span>
					</span>
				</button>

				<div class="ml-auto is-flex is-align-items-center">
					<button class="has-text-link is-uppercase has-text-weight-bold mr-4">preview</button>
					<button class="button is-link is-uppercase has-text-weight-bold"> save </button>
				</div>
			</div>
		</div>

		<div class="columns" style="height: {editorContentHeight}px;">
			<div class="column is-4 sidebar">
				<div
					class="chapters is-flex is-flex-direction-column"
					style="height: {slidePreviewHeight}px;"
				>
					{#each storymap.chapters as chapter, index}
						{@const slideNo = index + 1}
						{@const isActive = activeChapter?.id === chapter.id}
						<button
							class="is-flex chapter-preview p-1 {isActive ? 'is-active' : ''}"
							on:click={() => {
								handleChapterClicked(chapter);
							}}
						>
							<p class="slide-number mx-2">{slideNo}</p>
							<StorymapChapterMiniPreview bind:chapter {isActive} />
						</button>
					{/each}
				</div>
				<div class="p-2" bind:clientHeight={newslideButtonHeight}>
					<button class="button is-link is-uppercase has-text-weight-bold is-fullwidth">
						new slide
					</button>
				</div>
			</div>
			<div class="column"></div>
		</div>
	</div>
{/if}

<style lang="scss">
	.editor-container {
		overflow-y: hidden;

		.header {
			.storymap-title {
				min-width: 200px;
				max-width: 350px;
				border-bottom: 1px dotted gray;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				word-break: break-all;
			}
			.title-edit-button {
				background: transparent;
				border: none;
				outline: none;
				box-shadow: none;
			}
		}

		.sidebar {
			border-right-color: #f7f7f7;

			.chapters {
				overflow-y: auto;
				overflow-x: hidden;

				.chapter-preview {
					cursor: pointer;

					.slide-number {
						width: 24px;
					}
					&:hover {
						background-color: #f7f7f7;
					}

					&.is-active {
						background-color: #edeff0;
					}
				}
			}
		}
	}
</style>
