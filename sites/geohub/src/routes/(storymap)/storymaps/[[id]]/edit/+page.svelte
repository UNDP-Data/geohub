<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import StorymapChapterEdit, {
		ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY,
		createActiveStorymapChapterStore
	} from '$components/pages/storymap/StorymapChapterEdit.svelte';
	import StorymapChapterMiniPreview from '$components/pages/storymap/StorymapChapterMiniPreview.svelte';
	import StorymapEditPreview from '$components/pages/storymap/StorymapEditPreview.svelte';
	import StorymapHeaderEdit from '$components/pages/storymap/StorymapHeaderEdit.svelte';
	import StorymapHeaderMiniPreview from '$components/pages/storymap/StorymapHeaderMiniPreview.svelte';
	import StorymapMetaEdit from '$components/pages/storymap/StorymapMetaEdit.svelte';
	import { type StorymapBaseMapConfig } from '$components/pages/storymap/StorymapStyleSelector.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import { AccessLevel, MapStyles } from '$lib/config/AppConfig';
	import { imageUrlToBase64 } from '$lib/helper';
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
		FieldControl,
		initTooltipTippy,
		ModalTemplate,
		Notification,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { toast } from '@zerodevx/svelte-toast';
	import dayjs from 'dayjs';
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

	const activeStorymapChapterStore = createActiveStorymapChapterStore();
	setContext(ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY, activeStorymapChapterStore);

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

	// let activeChapter: StoryMapChapter | undefined;
	let isHeaderSlideActive = false;
	let showSlideSetting = false;

	let showPreview = false;
	let showSaveDialog = false;

	const handleChapterClicked = (chapter: unknown) => {
		const next = chapter as StoryMapChapter;
		if ($activeStorymapChapterStore?.id === next.id) return;
		handleSlideEditClosed();
		isHeaderSlideActive = false;
		$activeStorymapChapterStore = chapter as StoryMapChapter;
	};

	const handleheaderClicked = () => {
		if (isHeaderSlideActive) return;
		handleSlideEditClosed();
		$activeStorymapChapterStore = undefined as unknown as StoryMapChapter;
		isHeaderSlideActive = true;
	};

	let isDialogOpen = false;
	let requireUpdated = false;
	let requirePreviewUpdated = false;
	let requireHeaderUpdated = false;
	let isProcessing = false;

	onMount(() => {
		isHeaderSlideActive = true;

		setupStorymap();
	});

	const setupStorymap = async () => {
		const now = dayjs();
		let bylineText = `${$page.data.session?.user.name}, ${now.format('DD/MM/YYYY')}`;
		if (!$configStore) {
			const defaultMapStyle =
				MapStyles.find((s) => s.title === data.config.DefaultMapStyle) ?? MapStyles[0];
			let mapConfig: StorymapBaseMapConfig = {
				base_style_id: defaultMapStyle.title,
				style: defaultMapStyle.uri
			};

			const defaultLogo = await imageUrlToBase64(data.config.StorymapDefaultLogo);

			const initConfig: StoryMapConfig = {
				id: uuidv4(),
				byline: bylineText,
				footer: 'United Nations Development Programme',
				logo: defaultLogo,
				style: mapConfig.style as string,
				base_style_id: mapConfig.base_style_id,
				style_id: mapConfig.style_id,
				template_id: 'light',
				access_level: AccessLevel.PRIVATE,
				showProgress: true,
				chapters: []
			};
			$configStore = initConfig;

			handleInitialized();
		} else if ($configStore && !($configStore as StoryMapConfig).id) {
			$configStore.byline = bylineText;
			$configStore.footer = 'United Nations Development Programme';
			$configStore.logo = await imageUrlToBase64(data.config.StorymapDefaultLogo);
		}
		initBreadcrumbs();
	};

	const initBreadcrumbs = () => {
		breadcrumbs = breadcrumbs.splice(0, 2);
		if (data.storymap?.id) {
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
			requireHeaderUpdated = !requireHeaderUpdated;
		}, 500);
	};

	const handleNewSlide = async () => {
		const base_style_id = ($configStore as StoryMapConfig).base_style_id;
		const style_id = ($configStore as StoryMapConfig).style_id;

		let styleUrl = '';

		if (base_style_id) {
			const baseMap =
				MapStyles.find(
					(m) =>
						m.title.toLowerCase() === ($configStore as StoryMapConfig).base_style_id?.toLowerCase()
				) ?? MapStyles[0];
			styleUrl = new URL(baseMap.uri, $page.url.origin).href;
		} else {
			styleUrl = new URL(`/api/style/${style_id}.json`, $page.url.origin).href;
		}

		const lastChapter: StoryMapChapter | undefined =
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
				alignment: data.config.StorymapChapterCardAlignment,
				hidden: false,
				mapAnimation: data.config.StorymapChapterTransitionAnimation,
				mapInteractive: false,
				mapNavigationPosition: data.config.StorymapChapterNavigationControlPosition,
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
			$activeStorymapChapterStore = undefined as unknown as StoryMapChapter;
			showSlideSetting = true;
			requireHeaderUpdated = !requireHeaderUpdated;
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

		if ($activeStorymapChapterStore?.id === chapter.id) {
			showSlideSetting = !showSlideSetting;
		} else {
			showSlideSetting = true;
			isHeaderSlideActive = false;
			$activeStorymapChapterStore = chapter;
			requirePreviewUpdated = !requirePreviewUpdated;
		}
	};

	const handleSlideEditClosed = () => {
		showSlideSetting = false;
	};

	const handleSlideChanged = () => {
		if (!$activeStorymapChapterStore) return;

		for (let i = 0; i < $configStore.chapters.length; i++) {
			if ($configStore.chapters[i].id === $activeStorymapChapterStore.id) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				$configStore.chapters[i] = $activeStorymapChapterStore;
			}
		}
		requirePreviewUpdated = !requirePreviewUpdated;
	};

	const handleSlideDuplicated = (e: { detail: { chapter: StoryMapChapter } }) => {
		const chapter: StoryMapChapter = e.detail.chapter;
		const cIndex = $configStore.chapters.findIndex((c) => c.id === chapter.id);
		if (cIndex === -1) return;

		const duplicated = JSON.parse(JSON.stringify(chapter));
		duplicated.id = uuidv4();

		if (cIndex === $configStore.chapters.length - 1) {
			$configStore.chapters = [...$configStore.chapters, duplicated];
		} else {
			$configStore.chapters.splice(cIndex + 1, 0, duplicated);
			$configStore.chapters = [...$configStore.chapters];
		}
		requireUpdated = !requireUpdated;
	};

	const handleSlideDeleted = (e: { detail: { chapter: StoryMapChapter } }) => {
		const chapter: StoryMapChapter = e.detail.chapter;
		const cIndex = $configStore.chapters.findIndex((c) => c.id === chapter.id);
		if (cIndex === -1) return;

		const activeIndex = $configStore.chapters.findIndex(
			(c) => c.id === $activeStorymapChapterStore?.id
		);
		let tempActiveChapter: StoryMapChapter | undefined = undefined;
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
		$activeStorymapChapterStore = undefined as unknown as StoryMapChapter;

		$configStore.chapters = [...$configStore.chapters.filter((c) => c.id !== chapter.id)];

		requireUpdated = !requireUpdated;

		setTimeout(() => {
			$activeStorymapChapterStore = tempActiveChapter as StoryMapChapter;
			if (!$activeStorymapChapterStore) {
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
				showSaveDialog = false;
			}
		} finally {
			isProcessing = false;
		}
	};

	let hovering: string | undefined = undefined;
	let draggingUp = false;
	let draggedId: string | undefined = undefined;
	const dragstart = (
		event: DragEvent & { currentTarget: EventTarget & HTMLButtonElement },
		chapterId?: string
	) => {
		if (!event.dataTransfer) return;
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

	const dragover = (event: DragEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
		event.preventDefault();
		if (!event.dataTransfer) return;
		event.dataTransfer.dropEffect = 'move';
	};

	const dragenter = (
		event: DragEvent & { currentTarget: EventTarget & HTMLButtonElement },
		targetId: string
	) => {
		if (!event.dataTransfer) return;
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

	const drop = (
		event: DragEvent & { currentTarget: EventTarget & HTMLButtonElement },
		target: number
	) => {
		if (!event.dataTransfer) return;
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

	const getConfigForPreview = () => {
		const config: StoryMapConfig = JSON.parse(JSON.stringify($configStore));
		config.showProgress = false;
		return config;
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
					class="button is-link is-uppercase has-text-weight-bold"
					disabled={isProcessing || $configStore?.chapters.length === 0}
					on:click={() => {
						showSaveDialog = true;
					}}
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
							<StorymapHeaderMiniPreview
								bind:isActive={isHeaderSlideActive}
								on:edit={handleHeaderEdit}
								disabled={isProcessing}
							/>
						</button>
					{/key}

					{#key requireUpdated}
						{#each $configStore.chapters as chapter, index}
							{@const slideNo = index + 2}
							{@const isActive = $activeStorymapChapterStore?.id === chapter.id}
							<button
								class="is-flex chapter-preview py-3 pr-4 {isActive ? 'is-active' : ''} {hovering ===
								chapter.id
									? 'is-dropping'
									: ``} {draggingUp ? 'drag-up' : 'drag-down'}"
								on:click={() => {
									handleChapterClicked(chapter);
								}}
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
				{/if}
			</div>
			<div class="p-2" bind:clientHeight={newslideButtonHeight}>
				<button
					class="button is-link is-uppercase has-text-weight-bold is-fullwidth"
					on:click={handleNewSlide}
					disabled={isProcessing ||
						!($configStore?.title && $configStore.title.length > 0 && $configStore?.style)}
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
					{:else if $activeStorymapChapterStore}
						<StorymapChapterEdit
							bind:chapter={$activeStorymapChapterStore}
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
				{#if isHeaderSlideActive}
					{#key requireHeaderUpdated}
						<StorymapEditPreview height="{editorContentHeight}px" width="{slidePreviewWidth}px" />
					{/key}
				{:else if $configStore?.chapters.length > 0}
					{#if $activeStorymapChapterStore}
						{#key requireUpdated}
							{#key requirePreviewUpdated}
								<StorymapEditPreview
									bind:chapter={$activeStorymapChapterStore}
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
	<div
		class="preview"
		role="none"
		on:keydown={(e) => {
			if (e.key === 'Escape') {
				showPreview = false;
			}
		}}
	>
		<StoryMap config={getConfigForPreview()} bind:template={$configStore.template_id} />
		<div class="notification-overlay has-text-justified">
			<Notification type="info" showCloseButton={false} showIcon={false}>
				This preview's apperance might be slightly different from the actual storymap viewer.
			</Notification>
		</div>
		<button
			class="delete is-large"
			on:click={() => {
				showPreview = false;
			}}
		></button>
	</div>
{/if}

{#if showSaveDialog}
	<ModalTemplate title="Save" bind:show={showSaveDialog} showClose={!isProcessing}>
		<div class="content" slot="content">
			<p>Are you ready to save your storymap?</p>
			<p>
				Click <b>save</b> if you wish to save it. Close this dialog if you still want to modify it.
			</p>
			<p>
				Select <b>your organization</b> or <b>Public</b> if you want others to access your storymap
			</p>

			<FieldControl
				title="Access Level"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelp={false}
			>
				<div slot="control">
					<AccessLevelSwitcher
						bind:accessLevel={$configStore.access_level}
						size="normal"
						bind:disabled={isProcessing}
					/>
				</div>
			</FieldControl>
		</div>
		<div slot="buttons">
			<button
				class="button is-link is-uppercase has-text-weight-bold {isProcessing ? 'is-loading' : ''}"
				disabled={isProcessing || $configStore?.chapters.length === 0}
				on:click={handleSave}
			>
				save
			</button>
		</div>
	</ModalTemplate>
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
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		z-index: 100;
		background-color: white;

		.delete {
			position: fixed;
			top: 10px;
			right: 10px;
		}

		.notification-overlay {
			position: fixed;
			top: 10px;
			left: 10px;
			max-width: 300px;

			:global(.text) {
				padding: 0 !important;
			}
		}
	}
</style>
