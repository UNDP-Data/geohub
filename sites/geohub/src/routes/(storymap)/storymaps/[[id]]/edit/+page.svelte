<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import StorymapChapterEdit from '$components/pages/storymap/StorymapChapterEdit.svelte';
	import StorymapChapterMiniPreview from '$components/pages/storymap/StorymapChapterMiniPreview.svelte';
	import StorymapChapterPreview from '$components/pages/storymap/StorymapChapterPreview.svelte';
	import StorymapFooterEdit from '$components/pages/storymap/StorymapFooterEdit.svelte';
	import StorymapHeaderEdit from '$components/pages/storymap/StorymapHeaderEdit.svelte';
	import StorymapHeaderFooterMiniPreview from '$components/pages/storymap/StorymapHeaderFooterMiniPreview.svelte';
	import StorymapHeaderFooterPreview from '$components/pages/storymap/StorymapHeaderFooterPreview.svelte';
	import StorymapMetaEdit from '$components/pages/storymap/StorymapMetaEdit.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import {
		createStoryMapConfigStore,
		StoryMap,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from '@undp-data/svelte-maplibre-storymap';
	import {
		Breadcrumbs,
		initTooltipTippy,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { toast } from '@zerodevx/svelte-toast';
	import type { StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount, setContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import type { PageData } from './$types';

	export let data: PageData;

	const tippyTooltip = initTooltipTippy();

	let configStore: StoryMapConfigStore = createStoryMapConfigStore();
	setContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY, configStore);

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'storymaps', url: '/storymaps' }
	];

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
	let isHeaderSlideActive = false;
	let isFooterSlideActive = false;
	let showSlideSetting = false;

	let showPreview = false;

	const handleChapterClicked = (chapter: unknown) => {
		const next = chapter as StoryMapChapter;
		if (activeChapter?.id === next.id) return;
		handleSlideEditClosed();
		isHeaderSlideActive = false;
		isFooterSlideActive = false;
		activeChapter = chapter as StoryMapChapter;
	};

	const handleheaderClicked = () => {
		if (isHeaderSlideActive) return;
		handleSlideEditClosed();
		activeChapter = undefined;
		isHeaderSlideActive = true;
		isFooterSlideActive = false;
	};

	const handleFooterClicked = () => {
		if (isFooterSlideActive) return;
		handleSlideEditClosed();
		activeChapter = undefined;
		isFooterSlideActive = true;
		isHeaderSlideActive = false;
	};
	let isDialogOpen = false;
	let requireUpdated = false;
	let requirePreviewUpdated = false;
	let requireHeaderUpdated = false;
	let isProcessing = false;

	onMount(() => {
		isHeaderSlideActive = true;
		isDialogOpen = $configStore ? false : true;

		initBreadcrumbs();
	});

	const initBreadcrumbs = () => {
		breadcrumbs = breadcrumbs.splice(0, 2);
		if (data.storymap) {
			const storymapUrl = data.storymap.links.find((l) => l.rel === 'storymap')?.href;
			breadcrumbs = [
				...breadcrumbs,
				{
					title: data.storymap.title,
					url: storymapUrl
				},
				{ title: 'edit', url: $page.url.href }
			];
		} else {
			const title = $configStore?.title ?? 'new storymap';
			breadcrumbs = [...breadcrumbs, { title: title, url: $page.url.href }];
		}
	};

	const handleInitialized = async () => {
		if ($configStore?.chapters.length > 0) return;

		setTimeout(() => {
			isHeaderSlideActive = true;
			showSlideSetting = true;
		}, 500);
	};

	const handleNewSlide = async () => {
		const base_style_id = ($configStore as StoryMapConfig).base_style_id;
		const style_id = ($configStore as StoryMapConfig).style_id;

		let styleUrl = '';

		if (base_style_id) {
			const baseMap = MapStyles.find(
				(m) =>
					m.title.toLowerCase() === ($configStore as StoryMapConfig).base_style_id.toLowerCase()
			);
			styleUrl = new URL(baseMap.uri, $page.url.origin).href;
		} else {
			styleUrl = new URL(`/api/style/${style_id}.json`, $page.url.origin).href;
		}

		const lastChapter: StoryMapChapter =
			$configStore.chapters.length > 0
				? ($configStore.chapters[$configStore.chapters.length - 1] as unknown as StoryMapChapter)
				: undefined;

		const location = {
			center: lastChapter?.location.center ?? [0, 0],
			zoom: lastChapter?.location.zoom ?? 0,
			bearing: lastChapter?.location.bearing ?? 0,
			pitch: lastChapter?.location.pitch ?? 0
		};

		if (!lastChapter) {
			const res = await fetch(styleUrl);
			const style: StyleSpecification = await res.json();
			if (style.center) {
				location.center = style.center;
			}
			if (style.zoom) {
				location.zoom = style.zoom;
			}
			if (style.bearing) {
				location.bearing = style.bearing;
			}
			if (style.pitch) {
				location.pitch = style.pitch;
			}
		}

		$configStore.chapters = [
			...$configStore.chapters,
			{
				id: uuidv4(),
				title: 'Input title...',
				description: 'Input description...',
				location: location,
				style: lastChapter?.style ?? styleUrl,
				alignment: 'left',
				hidden: false,
				mapAnimation: 'flyTo',
				mapInteractive: false,
				mapNavigationPosition: 'top-right',
				spinGlobe: false,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				style_id: lastChapter?.style_id ?? style_id,
				base_style_id: lastChapter?.base_style_id ?? ($configStore as StoryMapConfig).base_style_id
			}
		];
	};

	const handleHeaderEdit = () => {
		if (!isHeaderSlideActive) {
			isHeaderSlideActive = true;
			isFooterSlideActive = false;
			activeChapter = undefined;
			showSlideSetting = true;
			requireHeaderUpdated = !requireHeaderUpdated;
		} else {
			showSlideSetting = !showSlideSetting;
		}
	};

	const handleFooterEdit = () => {
		if (!isFooterSlideActive) {
			isFooterSlideActive = true;
			isHeaderSlideActive = false;
			activeChapter = undefined;
			showSlideSetting = true;
			isFooterSlideActive = !isFooterSlideActive;
		} else {
			showSlideSetting = !showSlideSetting;
		}
	};

	const handleHeaderChanged = () => {
		if (!isHeaderSlideActive) return;
		requireHeaderUpdated = !requireHeaderUpdated;
	};

	const handleSlideEdit = (e: { detail: { chapter: StoryMapChapter } }) => {
		const chapter: StoryMapChapter = e.detail.chapter;

		if (!activeChapter) {
			showSlideSetting = true;
			isFooterSlideActive = false;
			isHeaderSlideActive = false;
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
			if (!activeChapter) {
				isHeaderSlideActive = true;
			}
		}, 300);
	};

	const handleSave = async () => {
		try {
			isProcessing = true;

			showSlideSetting = false;

			const res = await fetch(`/api/storymaps`, {
				method: 'POST',
				body: JSON.stringify($configStore)
			});
			if (!res.ok) {
				toast.push(res.statusText);
				return;
			} else {
				toast.push('Successfully saved the storymap to the database.');

				const storymap = await res.json();
				await goto(`/storymaps/${storymap.id}/edit`, {
					invalidateAll: true,
					replaceState: true,
					noScroll: true,
					keepFocus: true
				});
				$configStore = storymap;

				initBreadcrumbs();
			}
		} finally {
			isProcessing = false;
		}
	};

	let hovering: string | undefined = undefined;
	let draggingUp = false;
	let draggedId: string = undefined;
	const dragstart = (event, chapterId?: string) => {
		if (!chapterId) {
			event.preventDefault();
			event.dataTransfer.effectAllowed = 'none';
			event.dataTransfer.dropEffect = 'none';
			hovering = undefined;
			return;
		} else {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.dropEffect = 'move';
			draggedId = chapterId;
			event.dataTransfer.setData('text/plain', draggedId);
		}
	};

	const dragover = (event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	};

	const dragenter = (event, targetId: string) => {
		if (!draggedId) {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'none';
			hovering = undefined;
		} else {
			const startIndex = $configStore.chapters.findIndex((ch) => ch.id === draggedId);
			const endIndex = $configStore.chapters.findIndex((ch) => ch.id === targetId);
			draggingUp = endIndex < startIndex;
			hovering = targetId;
		}
	};

	const drop = (event, target: number) => {
		const chapterId = event.dataTransfer.getData('text/plain');
		if (!chapterId) {
			event.dataTransfer.dropEffect = 'none';
			hovering = undefined;
			draggedId = undefined;
			event.stopPropagation();
		} else {
			event.dataTransfer.dropEffect = 'move';
			const start = $configStore.chapters.findIndex((ch) => ch.id === chapterId);
			const newTracklist = JSON.parse(JSON.stringify($configStore.chapters));

			if (start === target) {
				event.dataTransfer.dropEffect = 'none';
				hovering = undefined;
				draggedId = undefined;
				event.stopPropagation();
				return;
			}

			if (start <= target) {
				newTracklist.splice(target + 1, 0, newTracklist[start]);
				newTracklist.splice(start, 1);
			} else {
				newTracklist.splice(target, 0, newTracklist[start]);
				newTracklist.splice(start + 1, 1);
			}
			$configStore.chapters = newTracklist;
			hovering = undefined;
			draggedId = undefined;
			requireUpdated = !requireUpdated;
		}
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
			<div>
				<Breadcrumbs pages={breadcrumbs} />
			</div>

			<div class="ml-auto is-flex is-align-items-center">
				<button
					class="button is-link is-outlined is-uppercase has-text-weight-bold mr-2"
					disabled={isProcessing}
					use:tippyTooltip={{
						content: 'Edit general settings of this story.'
					}}
					on:click={() => {
						storymapMetaEditor?.open();
					}}
				>
					settings
				</button>
				<button
					class="button is-link is-outlined is-uppercase has-text-weight-bold mr-2"
					disabled={isProcessing}
					on:click={() => {
						showPreview = true;
					}}
					use:tippyTooltip={{ content: 'Show preview for the current story settings' }}
				>
					preview
				</button>
				<button
					class="button is-link is-uppercase has-text-weight-bold {isProcessing
						? 'is-loading'
						: ''}"
					disabled={isProcessing || $configStore?.chapters.length === 0}
					on:click={handleSave}
					use:tippyTooltip={{ content: 'Save current story settings to the database.' }}
				>
					save
				</button>
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
					{#key requireHeaderUpdated}
						<button
							class="is-flex chapter-preview no-drag py-3 pr-4"
							on:click={() => {
								handleheaderClicked();
							}}
							use:tippyTooltip={{
								content: `${$configStore.title?.length > 0 ? $configStore.title : 'Please set title of the story'}`,
								offset: [0, -50]
							}}
							draggable={false}
							on:dragstart={(event) => {
								event.preventDefault();
							}}
							on:dragenter={(event) => {
								event.preventDefault();
								hovering = undefined;
							}}
						>
							<p class="slide-number px-4 is-size-7">{1}</p>
							<StorymapHeaderFooterMiniPreview
								isHeader={true}
								bind:isActive={isHeaderSlideActive}
								on:edit={handleHeaderEdit}
								disabled={isProcessing}
							/>
						</button>
					{/key}

					{#key requireUpdated}
						{#each $configStore.chapters as chapter, index}
							{@const slideNo = index + 2}
							{@const isActive = activeChapter?.id === chapter.id}
							<button
								class="is-flex chapter-preview py-3 pr-4 {isActive ? 'is-active' : ''} {hovering ===
								chapter.id
									? 'is-dropping'
									: ``} {draggingUp ? 'drag-up' : 'drag-down'}"
								on:click={() => {
									handleChapterClicked(chapter);
								}}
								use:tippyTooltip={{ content: `${chapter.title}`, offset: [0, -50] }}
								draggable={true}
								on:dragstart={(event) => dragstart(event, chapter.id)}
								on:drop|preventDefault={(event) => drop(event, index)}
								on:dragover={(event) => dragover(event)}
								on:dragenter={(event) => dragenter(event, chapter.id)}
							>
								<p class="slide-number px-4 is-size-7">{slideNo}</p>
								<StorymapChapterMiniPreview
									bind:chapter
									{isActive}
									on:edit={handleSlideEdit}
									on:delete={handleSlideDeleted}
									on:duplicate={handleSlideDuplicated}
									on:change={() => {
										requirePreviewUpdated = !requirePreviewUpdated;
									}}
									disabled={isProcessing}
								/>
							</button>
						{/each}
					{/key}

					<button
						class="is-flex chapter-preview no-drag py-3 pr-4"
						on:click={() => {
							handleFooterClicked();
						}}
						use:tippyTooltip={{
							content: `${$configStore.footer?.length > 0 ? $configStore.footer : 'Please set footer text of the story'}`,
							offset: [0, -50]
						}}
						on:dragstart={(event) => {
							event.preventDefault();
						}}
						on:dragenter={(event) => {
							event.preventDefault();
							hovering = undefined;
						}}
					>
						<p class="slide-number px-4 is-size-7">{$configStore?.chapters?.length + 2}</p>
						<StorymapHeaderFooterMiniPreview
							isHeader={false}
							bind:isActive={isFooterSlideActive}
							on:edit={handleFooterEdit}
							disabled={isProcessing}
						/>
					</button>
				{/if}
			</div>
			<div class="p-2" bind:clientHeight={newslideButtonHeight}>
				<button
					class="button is-link is-uppercase has-text-weight-bold is-fullwidth"
					on:click={handleNewSlide}
					disabled={isProcessing || !($configStore?.title?.length > 0 && $configStore?.style)}
					use:tippyTooltip={{ content: 'Add a new slide to the end.' }}
				>
					new slide
				</button>
			</div>
		</div>
		{#if showSlideSetting}
			<div class="slide-settings" style="width: {slideSettingWidth}px;">
				{#if $configStore}
					{#if isHeaderSlideActive}
						<StorymapHeaderEdit
							bind:width={slideSettingWidth}
							bind:height={editorContentHeight}
							on:change={handleHeaderChanged}
							on:textchange={initBreadcrumbs}
							on:close={handleSlideEditClosed}
						/>
					{:else if isFooterSlideActive}
						<StorymapFooterEdit
							bind:width={slideSettingWidth}
							bind:height={editorContentHeight}
							on:close={handleSlideEditClosed}
						/>
					{:else if activeChapter}
						<StorymapChapterEdit
							bind:chapter={activeChapter}
							bind:width={slideSettingWidth}
							bind:height={editorContentHeight}
							on:change={handleSlideChanged}
							on:close={handleSlideEditClosed}
						/>
					{/if}
				{/if}
			</div>
		{/if}
		<div class="slide-preview">
			{#if $configStore}
				{#if isHeaderSlideActive || isFooterSlideActive}
					{#key requireHeaderUpdated}
						<StorymapHeaderFooterPreview
							isHeader={isHeaderSlideActive}
							height="{editorContentHeight}px"
							width="{slidePreviewWidth}px"
						/>
					{/key}
				{:else if $configStore?.chapters.length > 0}
					{#if activeChapter}
						{#key requireUpdated}
							{#key requirePreviewUpdated}
								<StorymapChapterPreview
									bind:chapter={activeChapter}
									height="{editorContentHeight}px"
									width="{slidePreviewWidth}px"
								/>
							{/key}
						{/key}
					{/if}
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

{#if $configStore && showPreview}
	<div class="preview">
		<StoryMap bind:config={$configStore} bind:template={$configStore.template_id} />
		<button
			class="delete is-large"
			on:click={() => {
				showPreview = false;
			}}
		></button>
	</div>
{/if}

<style lang="scss">
	.editor-container {
		overflow-y: hidden;

		.chapters-editor {
			border-top: 1px solid #d4d6d8;

			.sidebar {
				.chapters {
					width: 264px;
					overflow-y: auto;
					overflow-x: hidden;

					.chapter-preview {
						cursor: grab;

						&.no-drag {
							cursor: pointer;
						}

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

						&.is-dropping {
							background-color: #f7f7f7;

							&.drag-up {
								border-top: 2px solid #55606e;
							}
							&.drag-down {
								border-bottom: 2px solid #55606e;
							}
						}
					}
				}
			}
		}
	}

	.preview {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 100;
		overflow-y: scroll;
		background-color: white;

		.delete {
			position: fixed;
			top: 10px;
			right: 10px;
		}
	}
</style>
