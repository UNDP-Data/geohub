<script lang="ts">
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
	import { Switch } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, getContext } from 'svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let isOpen = false;

	/** variables for storymap initialization */

	let templateButtons: SegmentButton[] = AvailableTemplates.map((t) => {
		return { title: t, value: t };
	});
	let initTemplateId: StoryMapTemplate = 'light';
	let initShowProgress =
		$configStore?.showProgress === undefined ? true : $configStore.showProgress;

	const handleInitialized = () => {
		($configStore as StoryMapConfig).template_id = initTemplateId;
		$configStore.showProgress = initShowProgress;
		$configStore = { ...$configStore };

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
			title="Appearance"
			isFirstCharCapitalized={true}
			showHelp={true}
			showHelpPopup={false}
		>
			<div slot="control">
				<SegmentButtons
					size="normal"
					capitalized={true}
					buttons={templateButtons}
					bind:selected={initTemplateId}
				/>
			</div>
			<div slot="help">Choose a template style for storymap appearance.</div>
		</FieldControl>

		<FieldControl
			title="Show progress bar"
			fontWeight="bold"
			isFirstCharCapitalized={false}
			showHelpPopup={false}
		>
			<div slot="control">
				<Switch bind:toggled={initShowProgress} />
			</div>
			<div slot="help">
				If enabled, a slide progress bar is shown on the right hand side of the entire storymap.
			</div>
		</FieldControl>
	</div>
	<div class="is-flex" slot="buttons">
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
