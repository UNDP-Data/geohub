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
	import { getContext } from 'svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	interface Props {
		isOpen?: boolean;
		onInit?: () => void;
	}

	let { isOpen = $bindable(false), onInit = () => {} }: Props = $props();

	/** variables for storymap initialization */

	let templateButtons: SegmentButton[] = AvailableTemplates.map((t) => {
		return { title: t, value: t };
	});
	let initTemplateId: StoryMapTemplate = $state('light');
	let initShowProgress = $state(
		$configStore?.showProgress === undefined ? true : $configStore.showProgress
	);

	const handleInitialized = () => {
		($configStore as StoryMapConfig).template_id = initTemplateId;
		$configStore.showProgress = initShowProgress;
		$configStore = { ...$configStore };

		isOpen = false;
		if (onInit) onInit();
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
	{#snippet content()}
		<div>
			<FieldControl
				title="Appearance"
				isFirstCharCapitalized={true}
				showHelp={true}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<SegmentButtons
							size="normal"
							capitalized={true}
							buttons={templateButtons}
							bind:selected={initTemplateId}
						/>
					</div>
				{/snippet}
				{#snippet help()}
					<div>Choose a template style for storymap appearance.</div>
				{/snippet}
			</FieldControl>

			<FieldControl
				title="Show progress bar"
				fontWeight="bold"
				isFirstCharCapitalized={false}
				showHelpPopup={false}
			>
				{#snippet control()}
					<div>
						<Switch
							toggled={initShowProgress}
							onchange={(toggled) => {
								initShowProgress = toggled;
							}}
						/>
					</div>
				{/snippet}
				{#snippet help()}
					<div>
						If enabled, a slide progress bar is shown on the right hand side of the entire storymap.
					</div>
				{/snippet}
			</FieldControl>
		</div>
	{/snippet}
	{#snippet buttons()}
		<div class="is-flex">
			<div class="footer-button">
				<button
					class="button is-primary is-uppercase has-text-weight-bold"
					onclick={handleInitialized}
				>
					{#if !$configStore}
						Continue
					{:else}
						Apply
					{/if}
				</button>
			</div>
		</div>
	{/snippet}
</ModalTemplate>
