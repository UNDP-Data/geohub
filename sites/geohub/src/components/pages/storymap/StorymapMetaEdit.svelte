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
	import { type StorymapBaseMapConfig } from './StorymapStyleSelector.svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let isOpen = false;

	/** variables for storymap initialization */

	let templateButtons: SegmentButton[] = AvailableTemplates.map((t) => {
		return { title: t, value: t };
	});
	let initTemplateId: StoryMapTemplate = 'light';
	let initAccessLevel: AccessLevel =
		($configStore as StoryMapConfig)?.access_level ?? AccessLevel.PUBLIC;
	let initShowProgress =
		$configStore?.showProgress === undefined ? true : $configStore.showProgress;

	const handleInitialized = () => {
		if (!$configStore) {
			const now = dayjs();

			let bylineText = `${$page.data.session?.user.name}, ${now.format('DD/MM/YYYY')}`;

			let mapConfig: StorymapBaseMapConfig = {};

			const initConfig: StoryMapConfig = {
				id: uuidv4(),
				byline: bylineText,
				footer: 'United Nations Development Programme',
				style: mapConfig.style as string,
				base_style_id: mapConfig.base_style_id,
				style_id: mapConfig.style_id,
				template_id: initTemplateId,
				access_level: initAccessLevel,
				showProgress: initShowProgress,
				chapters: []
			};
			$configStore = initConfig;
		} else {
			($configStore as StoryMapConfig).template_id = initTemplateId;
			($configStore as StoryMapConfig).access_level = initAccessLevel;
			$configStore.showProgress = initShowProgress;
			$configStore = { ...$configStore };
		}

		isOpen = false;

		dispatch('initialize', { config: $configStore });
	};

	export const open = () => {
		const config = $configStore as StoryMapConfig;
		if (config) {
			initTemplateId = config.template_id as StoryMapTemplate;
			initShowProgress = config.showProgress === undefined ? true : config.showProgress;
		}
		isOpen = true;
	};
</script>

<ModalTemplate title="Storymap setup" bind:show={isOpen} showClose={!$configStore ? false : true}>
	<div slot="content">
		<FieldControl
			title="Access Level"
			fontWeight="bold"
			isFirstCharCapitalized={false}
			showHelpPopup={false}
		>
			<div slot="control">
				<AccessLevelSwitcher bind:accessLevel={initAccessLevel} size="normal" />
			</div>
			<div slot="help">
				Select <b>your organization</b> or <b>Public</b> if you want others to access your storymap
			</div>
		</FieldControl>
		<FieldControl
			title="Appearance"
			isFirstCharCapitalized={true}
			showHelp={true}
			showHelpPopup={false}
		>
			<div slot="control">
				<SegmentButtons
					size="normal"
					capitalized={true}
					fontWeight="semibold"
					buttons={templateButtons}
					bind:selected={initTemplateId}
				/>
			</div>
			<div slot="help">Choose a template style for storymap appearance.</div>
		</FieldControl>

		<FieldControl
			title="Slide progress bar"
			fontWeight="bold"
			isFirstCharCapitalized={false}
			showHelpPopup={false}
		>
			<div slot="control">
				<input id="show-progress" type="checkbox" class="switch" bind:checked={initShowProgress} />
				<label class="pb-1" for="show-progress">Show slide progress bar</label>
			</div>
			<div slot="help">
				If enabled, a slide progress bar is shown on the right hand side of the entire storymap.
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
