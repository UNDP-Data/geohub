<script lang="ts">
	import { page } from '$app/stores';
	import StorymapChapterEdit from '$components/pages/storymap/StorymapChapterEdit.svelte';
	import StorymapChapterMiniPreview from '$components/pages/storymap/StorymapChapterMiniPreview.svelte';
	import StorymapChapterPreview from '$components/pages/storymap/StorymapChapterPreview.svelte';
	import StorymapMetaEdit from '$components/pages/storymap/StorymapMetaEdit.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import {
		createStoryMapConfigStore,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from '@undp-data/svelte-maplibre-storymap';
	import { getContext, onMount, setContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import type { PageData } from './$types';

	export let data: PageData;

	let configStore: StoryMapConfigStore = createStoryMapConfigStore();
	setContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY, configStore);

	let storymapMetaEditor: StorymapMetaEdit;

	const headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);
	let innerHeight: number;
	let editorHeaderHeight: number;
	let newslideButtonHeight: number;
	$: containerHeight = innerHeight - $headerHeightStore;
	$: editorContentHeight = containerHeight - editorHeaderHeight;
	$: slidePreviewHeight = editorContentHeight - newslideButtonHeight;

	let innerWidth: number;
	let sidebarWidth: number;
	let slideSettingWidth = 360;
	$: slidePreviewWidth = innerWidth - sidebarWidth - (showSlideSetting ? slideSettingWidth : 0);

	$configStore = data.storymap;

	let activeChapter: StoryMapChapter;
	let showSlideSetting = false;

	const getTitle = () => {
		return $configStore ? $configStore.title : 'new storymap';
	};

	const handleChapterClicked = (chapter: unknown) => {
		const next = chapter as StoryMapChapter;
		if (activeChapter?.id === next.id) return;
		handleSlideEditClosed();
		activeChapter = chapter as StoryMapChapter;
	};

	let isDialogOpen = false;
	let requireUpdated = false;

	onMount(() => {
		if ($configStore?.chapters.length > 0) {
			activeChapter = $configStore?.chapters[0] as unknown as StoryMapChapter;
		}

		isDialogOpen = $configStore ? false : true;
	});

	const handleInitialized = () => {
		if ($configStore?.chapters.length > 0) return;

		handleNewSlide();

		setTimeout(() => {
			activeChapter = $configStore.chapters[0] as unknown as StoryMapChapter;
		}, 500);
	};

	const handleNewSlide = () => {
		const baseMap = MapStyles.find(
			(m) => m.title.toLowerCase() === ($configStore as StoryMapConfig).base_style_id.toLowerCase()
		);
		const styleUrl = new URL(baseMap.uri, $page.url.origin).href;

		const lastChapter: StoryMapChapter =
			$configStore.chapters.length > 0
				? ($configStore.chapters[$configStore.chapters.length - 1] as unknown as StoryMapChapter)
				: undefined;

		$configStore.chapters = [
			...$configStore.chapters,
			{
				id: uuidv4(),
				title: 'Input title...',
				description: 'Input description...',
				location: {
					center: lastChapter?.location.center ?? [0, 0],
					zoom: lastChapter?.location.zoom ?? 0,
					bearing: lastChapter?.location.bearing ?? 0,
					pitch: lastChapter?.location.pitch ?? 0
				},
				style: lastChapter?.style ?? styleUrl,
				alignment: 'right',
				hidden: false,
				imageAlignment: 'right',
				mapAnimation: 'flyTo',
				mapInteractive: false,
				mapNavigationPosition: 'top-right',
				spinGlobe: false,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				style_id: lastChapter?.style_id ?? undefined,
				base_style_id: lastChapter?.base_style_id ?? ($configStore as StoryMapConfig).base_style_id
			}
		];
	};

	const handleSlideEdit = (e: { detail: { chapter: StoryMapChapter } }) => {
		const chapter: StoryMapChapter = e.detail.chapter;

		if (!activeChapter) {
			showSlideSetting = true;
			activeChapter = chapter;
			requireUpdated = !requireUpdated;
		} else {
			showSlideSetting = !showSlideSetting;
		}
	};

	const handleSlideEditClosed = () => {
		showSlideSetting = false;
	};

	const handleSlideChanged = () => {
		if (!activeChapter) return;

		for (let i = 0; i < $configStore.chapters.length; i++) {
			if ($configStore.chapters[i].id === activeChapter.id) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				$configStore.chapters[i] = activeChapter;
			}
		}
	};

	const handleSlideDuplicated = (e: { detail: { chapter: StoryMapChapter } }) => {
		const chapter: StoryMapChapter = e.detail.chapter;
		const cIndex = $configStore.chapters.findIndex((c) => c.id === chapter.id);
		if (cIndex === -1) return;

		const duplicated = JSON.parse(JSON.stringify(chapter));
		duplicated.id = uuidv4();

		if (cIndex === $configStore.chapters.length - 1) {
			$configStore.chapters.push(duplicated);
		} else {
			$configStore.chapters.splice(cIndex + 1, 0, duplicated);
		}
		$configStore.chapters = [...$configStore.chapters];

		requireUpdated = !requireUpdated;
	};

	const handleSlideDeleted = (e: { detail: { chapter: StoryMapChapter } }) => {
		const chapter: StoryMapChapter = e.detail.chapter;
		const cIndex = $configStore.chapters.findIndex((c) => c.id === chapter.id);
		if (cIndex === -1) return;

		const activeIndex = $configStore.chapters.findIndex((c) => c.id === activeChapter.id);
		let tempActiveChapter: StoryMapChapter = undefined;
		if (cIndex === activeIndex && $configStore.chapters.length > 1) {
			if (activeIndex === $configStore.chapters.length - 1) {
				// last chapter is active, set a chapter before
				tempActiveChapter = JSON.parse(
					JSON.stringify($configStore.chapters[activeIndex - 1])
				) as unknown as StoryMapChapter;
			} else {
				// otherwise set a chapter after as active
				tempActiveChapter = JSON.parse(
					JSON.stringify($configStore.chapters[activeIndex + 1])
				) as unknown as StoryMapChapter;
			}
		}
		activeChapter = undefined;

		$configStore.chapters = [...$configStore.chapters.filter((c) => c.id !== chapter.id)];

		requireUpdated = !requireUpdated;

		setTimeout(() => {
			activeChapter = tempActiveChapter;
		}, 300);
	};
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<div
	class="editor-container"
	style="height: {containerHeight}px;"
	hidden={$configStore ? false : true}
>
	<div class="header p-4" bind:clientHeight={editorHeaderHeight}>
		<div class="is-flex is-align-items-center">
			<p class="storymap-title mr-1">{getTitle()}</p>
			<button
				class="button is-small title-edit-button px-0"
				on:click={() => {
					storymapMetaEditor?.open();
				}}
			>
				<span class="icon is-small">
					<span class="material-symbols-outlined small-icon"> edit </span>
				</span>
			</button>

			<div class="ml-auto is-flex is-align-items-center">
				<button class="has-text-link is-uppercase has-text-weight-bold mr-4">preview</button>
				<button class="button is-link is-uppercase has-text-weight-bold"> save </button>
			</div>
		</div>
	</div>

	<div class="chapters-editor is-flex" style="height: {editorContentHeight}px;">
		<div class="sidebar" bind:clientWidth={sidebarWidth}>
			<div
				class="chapters is-flex is-flex-direction-column"
				style="height: {slidePreviewHeight}px;"
			>
				{#if $configStore}
					{#key requireUpdated}
						{#each $configStore.chapters as chapter, index}
							{@const slideNo = index + 1}
							{@const isActive = activeChapter?.id === chapter.id}
							<button
								class="is-flex chapter-preview py-3 pr-4 {isActive ? 'is-active' : ''}"
								on:click={() => {
									handleChapterClicked(chapter);
								}}
							>
								<p class="slide-number px-4 is-size-7">{slideNo}</p>
								<StorymapChapterMiniPreview
									bind:chapter
									{isActive}
									on:edit={handleSlideEdit}
									on:delete={handleSlideDeleted}
									on:duplicate={handleSlideDuplicated}
								/>
							</button>
						{/each}
					{/key}
				{/if}
			</div>
			<div class="p-2" bind:clientHeight={newslideButtonHeight}>
				<button
					class="button is-link is-uppercase has-text-weight-bold is-fullwidth"
					on:click={handleNewSlide}
				>
					new slide
				</button>
			</div>
		</div>
		{#if showSlideSetting}
			<div class="slide-settings" style="width: {slideSettingWidth}px;">
				<StorymapChapterEdit
					bind:chapter={activeChapter}
					bind:width={slideSettingWidth}
					bind:height={editorContentHeight}
					on:change={handleSlideChanged}
					on:close={handleSlideEditClosed}
				/>
			</div>
		{/if}
		<div class="slide-preview">
			{#if $configStore?.chapters.length > 0}
				{#if activeChapter}
					{#key requireUpdated}
						<StorymapChapterPreview
							bind:chapter={activeChapter}
							height="{editorContentHeight}px"
							width="{slidePreviewWidth}px"
						/>
					{/key}
				{/if}
			{/if}
		</div>
	</div>
</div>

<StorymapMetaEdit
	bind:isOpen={isDialogOpen}
	bind:this={storymapMetaEditor}
	on:initialize={handleInitialized}
/>

<style lang="scss">
	.editor-container {
		overflow-y: hidden;

		.header {
			.storymap-title {
				min-width: fit-content;
				max-width: 350px;
				border-bottom: 1px dotted #a9b1b7;
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

				.small-icon {
					font-size: 16px !important;
				}
			}
		}

		.chapters-editor {
			border-top: 1px solid #d4d6d8;

			.sidebar {
				.chapters {
					width: 264px;
					overflow-y: auto;
					overflow-x: hidden;

					.chapter-preview {
						cursor: pointer;

						.slide-number {
							width: 24px;
							color: #55606e;
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
	}
</style>
