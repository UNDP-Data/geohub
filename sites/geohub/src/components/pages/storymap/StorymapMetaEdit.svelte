<script lang="ts">
	import { page } from '$app/stores';
	import { MapStyles } from '$lib/config/AppConfig';
	import type { StoryMapConfig } from '$lib/types';
	import {
		AvailableTemplates,
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
	import { createEventDispatcher, getContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	const tippyTooltip = initTooltipTippy();

	const dispatch = createEventDispatcher();

	export let isOpen = false;

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
			$configStore.style = styleUrl;
			($configStore as StoryMapConfig).base_style_id = initBasemapStyleId;
			($configStore as StoryMapConfig).template_id = initTemplateId;

			$configStore.chapters.forEach((ch) => {
				if (!('style_id' in ch && ch.style_id)) {
					if ('base_style_id' in ch) {
						ch.base_style_id = initBasemapStyleId;
						ch.style = styleUrl;
					}
				}
			});

			$configStore = { ...$configStore };
		}

		isOpen = false;

		dispatch('initialize', { config: $configStore });
	};

	export const open = () => {
		const config = $configStore as StoryMapConfig;
		if (config) {
			initTitle = config.title;
			initSubtitle = config.subtitle;
			initFooter = config.footer;
			initBasemapStyleId = config.base_style_id;
			initTemplateId = config.template_id;
		}
		isOpen = true;
	};
</script>

<ModalTemplate title="Setup storymap" bind:show={isOpen} showClose={!$configStore ? false : true}>
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
		<div class="footer-button">
			{#if $configStore}
				<button
					data-testid="cancel-button"
					class="button is-link is-uppercase has-text-weight-bold"
					on:click={() => {
						isOpen = false;
					}}
				>
					cancel
				</button>
			{:else}
				<a
					data-testid="cancel-button"
					class="button is-link is-uppercase has-text-weight-bold"
					href="/storymaps"
				>
					Back
				</a>
			{/if}
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
