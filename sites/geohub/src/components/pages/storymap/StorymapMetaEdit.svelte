<script lang="ts">
	import { page } from '$app/stores';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import type { StoryMapConfig } from '$lib/types';
	import {
		AvailableTemplates,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import {
		FieldControl,
		ModalTemplate,
		SegmentButtons,
		type SegmentButton
	} from '@undp-data/svelte-undp-components';
	import dayjs from 'dayjs';
	import { createEventDispatcher, getContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import StorymapStyleSelector, {
		type StorymapBaseMapConfig
	} from './StorymapStyleSelector.svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let isOpen = false;

	/** variables for storymap initialization */

	let templateButtons: SegmentButton[] = AvailableTemplates.map((t) => {
		return { title: t, value: t };
	});
	let initTitle = '';
	let initDescription = '';
	let initTemplateId: StoryMapTemplate = 'light';
	let initAccessLevel: AccessLevel =
		($configStore as StoryMapConfig)?.access_level ?? AccessLevel.PUBLIC;

	let mapConfig: StorymapBaseMapConfig = {};

	const handleInitialized = () => {
		if (!$configStore) {
			const now = dayjs();

			let bylineText = `${$page.data.session.user.name}, ${now.format('DD/MM/YYYY')}`;

			const initConfig: StoryMapConfig = {
				id: uuidv4(),
				title: initTitle,
				description: initDescription,
				byline: bylineText,
				footer: 'United Nations Development Programme',
				style: mapConfig.style,
				base_style_id: mapConfig.base_style_id,
				style_id: mapConfig.style_id,
				template_id: initTemplateId,
				access_level: initAccessLevel,
				chapters: []
			};
			$configStore = initConfig;
		} else {
			$configStore.title = initTitle;
			$configStore.style = mapConfig.style;
			($configStore as StoryMapConfig).base_style_id = mapConfig.base_style_id;
			($configStore as StoryMapConfig).style_id = mapConfig.style_id;
			($configStore as StoryMapConfig).template_id = initTemplateId;
			($configStore as StoryMapConfig).access_level = initAccessLevel;
			($configStore as StoryMapConfig).description = initDescription;
			$configStore = { ...$configStore };
		}

		isOpen = false;

		dispatch('initialize', { config: $configStore });
	};

	const handleMapStyleChanged = () => {
		mapConfig.base_style_id = mapConfig.base_style_id;
		mapConfig.style_id = mapConfig.style_id;
		mapConfig.style = mapConfig.style;
	};

	export const open = () => {
		const config = $configStore as StoryMapConfig;
		if (config) {
			initTitle = config.title ?? '';
			initTemplateId = config.template_id;
			initDescription = config.description ?? '';

			mapConfig = {
				base_style_id: ($configStore as StoryMapConfig).base_style_id,
				style_id: ($configStore as StoryMapConfig).style_id,
				style: ($configStore as StoryMapConfig).style
			};
		}
		isOpen = true;
	};
</script>

<ModalTemplate title="Setup storymap" bind:show={isOpen} showClose={!$configStore ? false : true}>
	<div slot="content">
		{#if !$configStore}
			<FieldControl
				title="Title"
				isFirstCharCapitalized={true}
				showHelp={true}
				showHelpPopup={false}
			>
				<div slot="control">
					<input class="input" type="text" bind:value={initTitle} placeholder="Input title..." />
				</div>
				<div slot="help">
					Please provide title of your storymap. This will be used as title of the first slide.
				</div>
			</FieldControl>
		{/if}
		<FieldControl
			title="Description"
			isFirstCharCapitalized={true}
			showHelp={true}
			showHelpPopup={false}
		>
			<div slot="control">
				<textarea
					class="textarea"
					rows="3"
					bind:value={initDescription}
					placeholder="Input description..."
				></textarea>
			</div>
			<div slot="help">
				Please provide detailed description for your storymap. This description is shown at storymap
				portal page if provided.
			</div>
		</FieldControl>
		{#if !$configStore}
			<FieldControl
				title="Map style"
				isFirstCharCapitalized={true}
				showHelp={true}
				showHelpPopup={false}
			>
				<div slot="control">
					<StorymapStyleSelector bind:mapConfig on:change={handleMapStyleChanged} />
				</div>
				<div slot="help">Choose a default base map style for the storymap</div>
			</FieldControl>
		{/if}
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
			title="Please select storymap accessibility."
			fontWeight="bold"
			isFirstCharCapitalized={false}
			showHelpPopup={false}
		>
			<div slot="control">
				<AccessLevelSwitcher bind:accessLevel={initAccessLevel} />
			</div>
			<div slot="help">
				If you are ready to publish, select <b>Public</b>. If you selected your organisation or your
				name, the storymap can only be accessed by authenticated users.
			</div>
		</FieldControl>
	</div>
	<div class="is-flex" slot="buttons">
		{#if !$configStore}
			<div class="footer-button pr-2">
				<a
					data-testid="cancel-button"
					class="button is-link is-uppercase has-text-weight-bold"
					href="/storymaps"
				>
					Back
				</a>
			</div>
		{/if}
		<div class="footer-button">
			<button
				class="button is-primary is-uppercase has-text-weight-bold"
				on:click={handleInitialized}
				disabled={!(initTitle.length > 0 && mapConfig.style)}
			>
				{#if !$configStore}
					Continue
				{:else}
					Apply
				{/if}
			</button>
		</div>
	</div>
</ModalTemplate>
