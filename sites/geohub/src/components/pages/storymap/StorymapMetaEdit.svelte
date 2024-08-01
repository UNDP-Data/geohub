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

	let initFooter = 'United Nations Development Programme';
	let initAccessLevel: AccessLevel =
		($configStore as StoryMapConfig)?.access_level ?? AccessLevel.PUBLIC;

	const handleInitialized = () => {
		if (!$configStore) {
			const now = dayjs();

			let bylineText = `${$page.data.session.user.name}, ${now.format('DD/MM/YYYY')}`;

			let mapConfig: StorymapBaseMapConfig = {};

			const initConfig: StoryMapConfig = {
				id: uuidv4(),
				byline: bylineText,
				footer: initFooter,
				style: mapConfig.style,
				base_style_id: mapConfig.base_style_id,
				style_id: mapConfig.style_id,
				template_id: initTemplateId,
				access_level: initAccessLevel,
				chapters: []
			};
			$configStore = initConfig;
		} else {
			$configStore.footer = initFooter;
			($configStore as StoryMapConfig).template_id = initTemplateId;
			($configStore as StoryMapConfig).access_level = initAccessLevel;
			$configStore = { ...$configStore };
		}

		isOpen = false;

		dispatch('initialize', { config: $configStore });
	};

	export const open = () => {
		const config = $configStore as StoryMapConfig;
		if (config) {
			initFooter = config.footer;
			initTemplateId = config.template_id;
		}
		isOpen = true;
	};
</script>

<ModalTemplate title="Setup storymap" bind:show={isOpen} showClose={!$configStore ? false : true}>
	<div slot="content">
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
			title="credit"
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
				Type any information to be presented in the last slide of storymap. This can be any credit
				information like copyright.
			</div>
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
				disabled={!(initFooter.length > 0)}
			>
				Continue
			</button>
		</div>
	</div>
</ModalTemplate>
