<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import StorymapChapterEdit from '$components/pages/storymap/StorymapChapterEdit.svelte';
	import StorymapChapterMiniPreview from '$components/pages/storymap/StorymapChapterMiniPreview.svelte';
	import StorymapEditPreview from '$components/pages/storymap/StorymapEditPreview.svelte';
	import StorymapFooterEdit from '$components/pages/storymap/StorymapFooterEdit.svelte';
	import StorymapFooterEditPreview from '$components/pages/storymap/StorymapFooterEditPreview.svelte';
	import StorymapFooterMiniPreview from '$components/pages/storymap/StorymapFooterMiniPreview.svelte';
	import StorymapHeaderEdit from '$components/pages/storymap/StorymapHeaderEdit.svelte';
	import StorymapHeaderMiniPreview from '$components/pages/storymap/StorymapHeaderMiniPreview.svelte';
	import StorymapMetaEdit from '$components/pages/storymap/StorymapMetaEdit.svelte';
	import { type StorymapBaseMapConfig } from '$components/pages/storymap/StorymapStyleSelector.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import { AccessLevel, getAttribution, MapStyles } from '$lib/config/AppConfig';
	import { imageUrlToBase64 } from '$lib/helper';
	import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
	import {
		ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY,
		createActiveStorymapChapterStore,
		HEADER_HEIGHT_CONTEXT_KEY,
		type HeaderHeightStore
	} from '$stores';
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
	import { debounce } from 'lodash-es';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const tippyTooltip = initTooltipTippy();

	let configStore: StoryMapConfigStore = createStoryMapConfigStore();
	setContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY, configStore);

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'storymaps', url: '/storymaps' }
	]);

	let storymapMetaEditor: StorymapMetaEdit | undefined = $state();

	const activeStorymapChapterStore = createActiveStorymapChapterStore();
	setContext(ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY, activeStorymapChapterStore);

	const headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);
	let innerHeight: number = $state(0);
	let editorHeaderHeight: number = $state(0);
	let newslideButtonHeight: number = $state(0);

	let innerWidth: number = $state(0);
	let sidebarWidth: number = $state(0);
	let slideSettingWidth = $state(360);

	// let activeChapter: StoryMapChapter | undefined;
	let isHeaderSlideActive = $state(false);
	let isFooterSlideActive = $state(false);
	let showSlideSetting = $state(false);

	let showPreview = $state(false);
	let showSaveDialog = $state(false);

	const handleChapterClicked = (chapter: StoryMapChapter) => {
		if (!chapter) return;
		isHeaderSlideActive = false;
		isFooterSlideActive = false;

		const next = chapter as StoryMapChapter;
		if ($activeStorymapChapterStore?.id === next.id) return;
		handleSlideEditClosed();

		$activeStorymapChapterStore = chapter as StoryMapChapter;
	};

	const handleheaderClicked = () => {
		if (isHeaderSlideActive) return;
		handleSlideEditClosed();
		$activeStorymapChapterStore = undefined as unknown as StoryMapChapter;
		isHeaderSlideActive = true;
		isFooterSlideActive = false;
	};

	const handleFooterClicked = () => {
		if (isFooterSlideActive) return;
		handleSlideEditClosed();
		$activeStorymapChapterStore = undefined as unknown as StoryMapChapter;
		isFooterSlideActive = true;
		isHeaderSlideActive = false;
	};

	let isDialogOpen = $state(false);
	let requireUpdated = $state(false);
	let requirePreviewUpdated = $state(false);
	let requireHeaderUpdated = $state(false);
	let requireEditorUpdated = $state(false);
	let isProcessing = $state(false);

	onMount(() => {
		$configStore = data.storymap as StoryMapConfig;

		isHeaderSlideActive = true;

		setupStorymap();
	});

	const setupStorymap = async () => {
		const now = dayjs();
		let bylineText = `${page.data.session?.user.name}, ${now.format('DD/MM/YYYY')}`;

		const defaultFooter = `<center>${getAttribution(false)}</center>`;

		if (!$configStore) {
			const defaultMapStyle =
				MapStyles.find((s) => s.title === data.config.DefaultMapStyle) ?? MapStyles[0];
			let mapConfig: StorymapBaseMapConfig = {
				base_style_id: defaultMapStyle.id,
				style: defaultMapStyle.uri
			};

			const defaultLogo = await imageUrlToBase64(data.config.StorymapDefaultLogo);

			const initConfig: StoryMapConfig = {
				id: uuidv4(),
				title: 'Untitled',
				byline: bylineText,
				footer: defaultFooter,
				logo: defaultLogo,
				style: mapConfig.style as string,
				base_style_id: mapConfig.base_style_id,
				style_id: mapConfig.style_id,
				template_id: 'light',
				hillshade: mapConfig.hillshade,
				terrain: mapConfig.terrain,
				access_level: AccessLevel.PRIVATE,
				showProgress: true,
				chapters: [],
				location: {
					center: [0, 0],
					zoom: 0,
					bearing: 0,
					pitch: 0
				}
			};
			$configStore = initConfig;

			handleInitialized();
		} else if ($configStore && !($configStore as StoryMapConfig).id) {
			$configStore.byline = bylineText;
			$configStore.footer = defaultFooter;
			$configStore.logo = await imageUrlToBase64(data.config.StorymapDefaultLogo);
		}
		initBreadcrumbs();
	};

	const initBreadcrumbs = () => {
		breadcrumbs = breadcrumbs.splice(0, 2);
		if (($configStore as StoryMapConfig)?.id) {
			const storymapUrl = ($configStore as StoryMapConfig).links?.find(
				(l) => l.rel === 'storymap'
			)?.href;
			breadcrumbs = [
				...breadcrumbs,
				{
					title:
						$configStore.title && $configStore.title.length > 0 ? $configStore.title : 'untitled',
					url: storymapUrl
				},
				{ title: 'edit', url: page.url.href }
			];
		} else {
			const title =
				$configStore?.title && $configStore?.title.length > 0 ? $configStore?.title : 'untitled';
			breadcrumbs = [...breadcrumbs, { title: title, url: page.url.href }];
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
		try {
			isProcessing = true;

			const base_style_id = ($configStore as StoryMapConfig).base_style_id;
			const style_id = ($configStore as StoryMapConfig).style_id;

			let styleUrl = '';

			if (style_id) {
				const mapUrl = new URL(`/api/style/${style_id}.json`, page.url.origin);
				if (base_style_id) {
					mapUrl.searchParams.set('basemap', base_style_id);
				}
				styleUrl = mapUrl.href;
			} else {
				const baseMap =
					MapStyles.find(
						(m) =>
							m.id.toLowerCase() === ($configStore as StoryMapConfig).base_style_id?.toLowerCase()
					) ?? MapStyles[0];
				styleUrl = new URL(baseMap.uri, page.url.origin).href;
			}

			const lastChapter: StoryMapChapter | undefined =
				$configStore.chapters.length > 0
					? ($configStore.chapters[$configStore.chapters.length - 1] as unknown as StoryMapChapter)
					: undefined;

			const location = {
				center: lastChapter?.location.center ??
					($configStore as StoryMapConfig).location?.center ?? [0, 0],
				zoom: lastChapter?.location.zoom ?? ($configStore as StoryMapConfig).location?.zoom ?? 0,
				bearing:
					lastChapter?.location.bearing ?? ($configStore as StoryMapConfig).location?.bearing ?? 0,
				pitch: lastChapter?.location.pitch ?? ($configStore as StoryMapConfig).location?.pitch ?? 0
			};

			if (!lastChapter) {
				const res = await fetch(styleUrl);
				const style: StyleSpecification = await res.json();
				if (style.center) {
					location.center = style.center as [number, number];
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
					rotateAnimation: lastChapter?.rotateAnimation ?? false,
					spinGlobe: lastChapter?.spinGlobe ?? false,
					projection: lastChapter?.projection ?? $configStore.projection ?? undefined,
					showLegend: true,
					legendPosition: 'bottom-left',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					style_id: lastChapter?.style_id ?? style_id,
					base_style_id:
						lastChapter?.base_style_id ?? ($configStore as StoryMapConfig).base_style_id
				}
			];

			showSlideSetting = false;
			requirePreviewUpdated = !requirePreviewUpdated;
		} finally {
			isProcessing = false;
		}
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

	const handleFooterEdit = () => {
		isHeaderSlideActive = false;
		if (!isFooterSlideActive) {
			isFooterSlideActive = true;
			showSlideSetting = true;
		} else {
			showSlideSetting = !showSlideSetting;
		}
	};

	const handleHeaderChanged = debounce(() => {
		if (!isHeaderSlideActive) return;
		requireHeaderUpdated = !requireHeaderUpdated;
		requirePreviewUpdated = !requirePreviewUpdated;
	}, 500);

	const handleSlideEdit = debounce((chapter: StoryMapChapter) => {
		if ($activeStorymapChapterStore?.id === chapter.id) {
			showSlideSetting = !showSlideSetting;
		} else {
			showSlideSetting = true;
			isHeaderSlideActive = false;
			isFooterSlideActive = false;
			activeStorymapChapterStore.set(chapter);
			requirePreviewUpdated = !requirePreviewUpdated;
			requireEditorUpdated = !requireEditorUpdated;
		}
	}, 500);

	const handleSlideEditClosed = () => {
		showSlideSetting = false;
	};

	const handleSlideChanged = debounce(() => {
		if (!$activeStorymapChapterStore) return;

		for (let i = 0; i < $configStore.chapters.length; i++) {
			if ($configStore.chapters[i].id === $activeStorymapChapterStore.id) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				$configStore.chapters[i] = $activeStorymapChapterStore;
			}
		}
		requirePreviewUpdated = !requirePreviewUpdated;
	}, 500);

	const handleSlideDuplicated = (chapter: StoryMapChapter) => {
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

	const handleSlideDeleted = (chapter: StoryMapChapter) => {
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

	let hovering: string | undefined = $state(undefined);
	let draggingUp = $state(false);
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
	let containerHeight = $derived(innerHeight - $headerHeightStore);
	let editorContentHeight = $derived(containerHeight - editorHeaderHeight);
	let slidePreviewHeight = $derived(editorContentHeight - newslideButtonHeight);
	let slidePreviewWidth = $derived(
		innerWidth - sidebarWidth - (showSlideSetting ? slideSettingWidth : 0)
	);
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
			{#if !data.session}
				<div>
					<Notification showCloseButton={false} showIcon={false} type="warning">
						You can't save a storymap. Please sign in first.
					</Notification>
				</div>
			{/if}

			<div class="ml-auto is-flex is-align-items-center">
				<button
					class="button {isProcessing
						? ''
						: 'is-link is-outlined'}  is-uppercase has-text-weight-bold mr-2 {isProcessing
						? 'is-loading'
						: ''}"
					disabled={isProcessing}
					use:tippyTooltip={{
						content: 'Edit general settings of this story.'
					}}
					onclick={() => {
						storymapMetaEditor?.open();
					}}
				>
					settings
				</button>
				<button
					class="button {isProcessing
						? ''
						: 'is-link is-outlined'}  is-uppercase has-text-weight-bold mr-2 {isProcessing
						? 'is-loading'
						: ''}"
					disabled={isProcessing}
					onclick={() => {
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
					disabled={isProcessing || !data.session}
					onclick={() => {
						showSaveDialog = true;
					}}
					use:tippyTooltip={{
						content: 'Save current story settings to the database.'
					}}
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
							onclick={() => {
								handleheaderClicked();
							}}
							draggable={false}
							ondragstart={(event) => {
								event.preventDefault();
							}}
							ondragenter={(event) => {
								event.preventDefault();
								hovering = undefined;
							}}
						>
							<p class="slide-number px-4 is-size-7">{1}</p>
							<StorymapHeaderMiniPreview
								bind:isActive={isHeaderSlideActive}
								onedit={handleHeaderEdit}
								disabled={isProcessing}
							/>
						</button>
					{/key}

					{#key requireUpdated}
						{#each $configStore.chapters as chapter, index (chapter.id)}
							{@const slideNo = index + 2}
							{@const isActive = $activeStorymapChapterStore?.id === chapter.id}
							<button
								class="is-flex chapter-preview py-3 pr-4 {isActive ? 'is-active' : ''} {hovering ===
								chapter.id
									? 'is-dropping'
									: ``} {draggingUp ? 'drag-up' : 'drag-down'}"
								onclick={() => {
									handleChapterClicked(chapter as unknown as StoryMapChapter);
								}}
								draggable={true}
								ondragstart={(event) => dragstart(event, chapter.id)}
								ondrop={(event) => {
									event.preventDefault();
									drop(event, index);
								}}
								ondragover={(event) => dragover(event)}
								ondragenter={(event) => dragenter(event, chapter.id)}
							>
								<p class="slide-number px-4 is-size-7">{slideNo}</p>
								<StorymapChapterMiniPreview
									bind:chapter={$configStore.chapters[index]}
									{isActive}
									onedit={handleSlideEdit}
									ondelete={handleSlideDeleted}
									onduplicate={handleSlideDuplicated}
									onchange={() => {
										requirePreviewUpdated = !requirePreviewUpdated;
									}}
									disabled={isProcessing}
								/>
							</button>
						{/each}
					{/key}

					<button
						class="is-flex chapter-preview no-drag py-3 pr-4"
						onclick={() => {
							handleFooterClicked();
						}}
						draggable={false}
						ondragstart={(event) => {
							event.preventDefault();
						}}
						ondragenter={(event) => {
							event.preventDefault();
							hovering = undefined;
						}}
					>
						<p class="slide-number px-4 is-size-7">{$configStore.chapters.length + 2}</p>
						<StorymapFooterMiniPreview
							bind:isActive={isFooterSlideActive}
							onedit={handleFooterEdit}
							disabled={isProcessing}
						/>
					</button>
				{/if}
			</div>
			<div class="p-2" bind:clientHeight={newslideButtonHeight}>
				<button
					class="button is-link is-uppercase has-text-weight-bold is-fullwidth {isProcessing
						? 'is-loading'
						: ''}"
					onclick={handleNewSlide}
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
							height={editorContentHeight}
							onchange={handleHeaderChanged}
							ontextchange={initBreadcrumbs}
							onclose={handleSlideEditClosed}
						/>
					{:else if isFooterSlideActive}
						<StorymapFooterEdit
							bind:width={slideSettingWidth}
							height={editorContentHeight}
							onclose={handleSlideEditClosed}
						/>
					{:else if $activeStorymapChapterStore}
						{#key requireEditorUpdated}
							<StorymapChapterEdit
								bind:width={slideSettingWidth}
								height={editorContentHeight}
								onchange={handleSlideChanged}
								onclose={handleSlideEditClosed}
							/>
						{/key}
					{/if}
				{/if}
			</div>
		{/if}
		<div class="slide-preview">
			{#if $configStore}
				{#if isHeaderSlideActive}
					{#key requirePreviewUpdated}
						<StorymapEditPreview height={editorContentHeight} width="{slidePreviewWidth}px" />
					{/key}
				{:else if isFooterSlideActive}
					<StorymapFooterEditPreview width="{slidePreviewWidth}px" />
				{:else if $configStore?.chapters.length > 0}
					{#if $activeStorymapChapterStore}
						{#key requireUpdated}
							{#key requirePreviewUpdated}
								<StorymapEditPreview
									bind:chapter={$activeStorymapChapterStore}
									height={editorContentHeight}
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
	onInit={handleInitialized}
/>

{#if $configStore && showPreview}
	<div
		class="preview"
		role="none"
		onkeydown={(e) => {
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
			onclick={() => {
				showPreview = false;
			}}
			aria-label="delete"
		></button>
	</div>
{/if}

{#if showSaveDialog}
	<ModalTemplate title="Save or Publish" bind:show={showSaveDialog} showClose={!isProcessing}>
		{#snippet content()}
			<div>
				<FieldControl
					title="Select access level"
					fontWeight="bold"
					isFirstCharCapitalized={false}
					showHelp={true}
					showHelpPopup={false}
				>
					{#snippet control()}
						<div>
							<AccessLevelSwitcher
								bind:accessLevel={$configStore.access_level}
								size="normal"
								bind:disabled={isProcessing}
							/>
						</div>
					{/snippet}
					{#snippet help()}
						<div>
							{#if $configStore.access_level === AccessLevel.PRIVATE}
								Your storymap is private and only visible to you. To share it, select your
								organization for internal access or Public to make it available to everyone.
							{:else if $configStore.access_level === AccessLevel.ORGANIZATION}
								Your storymap is visible to everyone within your organization. If you want to
								restrict access, choose Private or to share it more broadly, select Public.
							{:else}
								Your storymap is public and can be viewed by anyone, including those outside your
								organization. To limit visibility, choose your organization or Private.
							{/if}
						</div>
					{/snippet}
				</FieldControl>
			</div>
		{/snippet}
		{#snippet buttons()}
			<div>
				<button
					class="button is-primary is-uppercase has-text-weight-bold {isProcessing
						? 'is-loading'
						: ''}"
					disabled={isProcessing}
					onclick={handleSave}
				>
					save
				</button>

				<button
					class="cancel-button button is-light is-uppercase has-text-weight-bold {isProcessing
						? 'is-loading'
						: ''}"
					disabled={isProcessing}
					onclick={() => {
						showSaveDialog = false;
					}}
				>
					cancel
				</button>
			</div>
		{/snippet}
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

	.cancel-button {
		box-shadow: none !important;
		&.is-light {
			background-color: #edeff0 !important;
		}
	}
</style>
