<script lang="ts">
	import { page } from '$app/stores';
	import StorymapChapterMiniPreview from '$components/pages/storymap/StorymapChapterMiniPreview.svelte';
	import StorymapChapterPreview from '$components/pages/storymap/StorymapChapterPreview.svelte';
	import { MapStyles } from '$lib/config/AppConfig';
	import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import {
		AvailableTemplates,
		createStoryMapConfigStore,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import {
		FieldControl,
		initTooltipTippy,
		ModalTemplate,
		SegmentButtons,
		type SegmentButton
	} from '@undp-data/svelte-undp-components';
	import { getContext, onMount, setContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import type { PageData } from './$types';

	export let data: PageData;

	const tippyTooltip = initTooltipTippy();

	let configStore: StoryMapConfigStore = createStoryMapConfigStore();
	setContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY, configStore);

	const headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);
	let innerHeight: number;
	let editorHeaderHeight: number;
	let newslideButtonHeight: number;
	$: containerHeight = innerHeight - $headerHeightStore;
	$: editorContentHeight = containerHeight - editorHeaderHeight;
	$: slidePreviewHeight = editorContentHeight - newslideButtonHeight;

	let innerWidth: number;
	let sidebarWidth: number;
	$: slidePreviewWidth = innerWidth - sidebarWidth;

	$configStore = data.storymap;

	let activeChapter: StoryMapChapter;

	const getTitle = () => {
		return $configStore ? $configStore.title : 'new storymap';
	};

	const handleChapterClicked = (chapter: unknown) => {
		const next = chapter as StoryMapChapter;
		if (activeChapter?.id === next.id) return;
		activeChapter = chapter as StoryMapChapter;
	};

	let isDialogOpen = false;

	onMount(() => {
		if ($configStore?.chapters.length > 0) {
			activeChapter = $configStore?.chapters[0] as unknown as StoryMapChapter;
		}

		isDialogOpen = $configStore ? false : true;
	});

	/** variables for storymap initialization */

	let initTitle = '';
	let initSubtitle = '';

	let templateButtons: SegmentButton[] = AvailableTemplates.map((t) => {
		return { title: t, value: t };
	});
	let initTemplateId: StoryMapTemplate = 'light';

	let initBasemapStyleId = MapStyles[0].title;
	let initFooter = 'United Nations Development Programme';

	const handleInitialized = () => {
		const baseMap = MapStyles.find(
			(m) => m.title.toLowerCase() === initBasemapStyleId.toLowerCase()
		);
		const styleUrl = new URL(baseMap.uri, $page.url.origin).href;

		if (!$configStore) {
			const initConfig: StoryMapConfig = {
				id: uuidv4(),
				title: initTitle,
				subtitle: initSubtitle,
				byline: $page.data.session.user.name,
				footer: initFooter,
				style: styleUrl,
				base_style_id: initBasemapStyleId,
				template_id: initTemplateId,
				chapters: []
			};
			$configStore = initConfig;
		} else {
			$configStore.title = initTitle;
			$configStore.subtitle = initSubtitle;
			$configStore.byline = $page.data.session.user.name;
			$configStore.footer = initFooter;
			($configStore.style = styleUrl),
				(($configStore as StoryMapConfig).base_style_id = initBasemapStyleId),
				(($configStore as StoryMapConfig).template_id = initTemplateId);

			$configStore = { ...$configStore };
		}

		isDialogOpen = false;
	};

	const openEditCommonConfig = () => {
		const config = $configStore as StoryMapConfig;
		initTitle = config.title;
		initSubtitle = config.subtitle;
		initFooter = config.footer;
		initBasemapStyleId = config.base_style_id;
		initTemplateId = config.template_id;
		isDialogOpen = true;
	};

	const handleNewSlide = () => {
		const baseMap = MapStyles.find(
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			(m) => m.title.toLowerCase() === $configStore.base_style_id.toLowerCase()
		);
		const styleUrl = new URL(baseMap.uri, $page.url.origin).href;

		const lastChapter =
			$configStore.chapters.length > 0
				? $configStore.chapters[$configStore.chapters.length - 1]
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
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				base_style_id: lastChapter?.location.base_style_id ?? initBasemapStyleId
			}
		];
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
			<button class="button is-small title-edit-button px-0" on:click={openEditCommonConfig}>
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
		<div class="sidebar pr-2" bind:clientWidth={sidebarWidth}>
			<div
				class="chapters is-flex is-flex-direction-column"
				style="height: {slidePreviewHeight}px;"
			>
				{#if $configStore}
					{#each $configStore?.chapters as chapter, index}
						{@const slideNo = index + 1}
						{@const isActive = activeChapter?.id === chapter.id}
						<button
							class="is-flex chapter-preview py-3 pr-4 {isActive ? 'is-active' : ''}"
							on:click={() => {
								handleChapterClicked(chapter);
							}}
						>
							<p class="slide-number px-4 is-size-7">{slideNo}</p>
							<StorymapChapterMiniPreview bind:chapter {isActive} />
						</button>
					{/each}
				{/if}
			</div>
			<div class="py-2 pl-2" bind:clientHeight={newslideButtonHeight}>
				<button
					class="button is-link is-uppercase has-text-weight-bold is-fullwidth"
					on:click={handleNewSlide}
				>
					new slide
				</button>
			</div>
		</div>
		<div class="slide-preview">
			{#if $configStore?.chapters.length > 0}
				{#if activeChapter}
					<StorymapChapterPreview
						bind:chapter={activeChapter}
						height="{editorContentHeight}px"
						width="{slidePreviewWidth}px"
					/>
				{/if}
			{/if}
		</div>
	</div>
</div>

<ModalTemplate title="Setup storymap" bind:show={isDialogOpen} showClose={false}>
	<div slot="content">
		<FieldControl title="title" isFirstCharCapitalized={true} showHelp={true} showHelpPopup={false}>
			<div slot="control">
				<input
					class="input {initTitle.length === 0 ? 'is-danger' : 'is-success'}"
					type="text"
					placeholder="Type title of storymap"
					bind:value={initTitle}
				/>
			</div>
			<div slot="help">Type title to be presented in the first slide of storymap.</div>
		</FieldControl>
		<FieldControl
			title="subtitle"
			isFirstCharCapitalized={true}
			showHelp={true}
			showHelpPopup={false}
		>
			<div slot="control">
				<input
					class="input {initSubtitle.length === 0 ? '' : 'is-success'}"
					type="text"
					placeholder="Type subtitle of storymap"
					bind:value={initSubtitle}
				/>
			</div>
			<div slot="help">
				Type subtitle to be presented in the first slide of storymap. This is optional.
			</div>
		</FieldControl>
		<FieldControl
			title="Storymap template"
			isFirstCharCapitalized={true}
			showHelp={true}
			showHelpPopup={false}
		>
			<div slot="control">
				<SegmentButtons
					size="small"
					capitalized={true}
					fontWeight="semibold"
					buttons={templateButtons}
					bind:selected={initTemplateId}
				/>
			</div>
			<div slot="help">Choose a template style for storymap appearance.</div>
		</FieldControl>
		<FieldControl
			title="Base map style"
			isFirstCharCapitalized={true}
			showHelp={true}
			showHelpPopup={false}
		>
			<div slot="control" class="basemap-style-selector">
				{#each MapStyles as style}
					<label
						class="m-1"
						use:tippyTooltip={{
							content: `Use ${style.title === 'Carto' ? 'Standard' : style.title} style as default.`
						}}
					>
						<input
							on:click={() => (initBasemapStyleId = style.title)}
							type="radio"
							name="DefaultMapStyle"
							value={style.title}
							checked={initBasemapStyleId.toLowerCase() === style.title.toLowerCase()}
						/>
						<img
							class="sidebar-image"
							src={style.image}
							alt="{style.title} style"
							width="64"
							height="64"
							loading="lazy"
						/>
					</label>
				{/each}
			</div>
			<div slot="help">Choose a default base map style for the storymap.</div>
		</FieldControl>
		<FieldControl
			title="footer"
			isFirstCharCapitalized={true}
			showHelp={true}
			showHelpPopup={false}
		>
			<div slot="control">
				<input
					class="input {initFooter.length === 0 ? 'is-danger' : 'is-success'}"
					type="text"
					placeholder="Type footer content of storymap"
					bind:value={initFooter}
				/>
			</div>
			<div slot="help">
				Type footer content to be presented in the last slide of storymap. This can be any credit
				text like copyright.
			</div>
		</FieldControl>
	</div>
	<div class="is-flex" slot="buttons">
		<div class="footer-button px-2">
			<a
				data-testid="cancel-button"
				class="button is-link is-uppercase has-text-weight-bold"
				href="/storymaps"
			>
				Back
			</a>
		</div>
		<div class="footer-button px-2">
			<button
				class="button is-primary is-uppercase has-text-weight-bold"
				on:click={handleInitialized}
				disabled={!(initTitle.length > 0 && initFooter.length > 0)}
			>
				Continue
			</button>
		</div>
	</div>
</ModalTemplate>

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
				min-width: 200px;

				.chapters {
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

	.basemap-style-selector {
		[type='radio'] {
			position: absolute;
			opacity: 0;
			width: 0;
			height: 0;
		}

		[type='radio'] + img {
			cursor: pointer;
		}

		[type='radio']:checked + img {
			outline: 2px solid #f00;
		}

		.sidebar-image {
			box-shadow: #0a0a0a 0 0 2px 0;
		}
	}
</style>
