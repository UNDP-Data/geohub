<script lang="ts">
	import type { StoryMapConfig } from '$lib/types';
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from '@undp-data/svelte-maplibre-storymap';
	import {
		Accordion,
		FieldControl,
		FloatingPanel,
		Help,
		Tabs,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import ImageUploader from './ImageUploader.svelte';
	import StorymapStyleSelector, {
		type StorymapBaseMapConfig
	} from './StorymapStyleSelector.svelte';

	const dispatch = createEventDispatcher();

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	export let width = 360;
	export let height = 500;

	let tabHeight = 0;
	let panelHeaderHeight: 0;
	$: tabContentHeight = height - tabHeight - panelHeaderHeight - 30;

	let tabs: Tab[] = [
		{ label: 'card', id: 'card' },
		{ label: 'map', id: 'map' }
	];
	let activeTab = tabs[0].id;

	let mapConfig: StorymapBaseMapConfig = {
		base_style_id: ($configStore as StoryMapConfig).base_style_id,
		style_id: ($configStore as StoryMapConfig).style_id,
		style: ($configStore as StoryMapConfig).style
	};

	const handleChange = () => {
		dispatch('change');
	};

	const handleTextChanged = () => {
		dispatch('textchange');
	};

	const handleClose = () => {
		dispatch('close');
	};

	let expanded: { [key: string]: boolean } = { text: true };
	// to allow only an accordion to be expanded
	let expandedId: string;
	$: {
		let expandedIds = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedId
		);
		if (expandedIds.length > 0) {
			expandedId = expandedIds[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedIds[0]] = true;
		}
	}

	onMount(() => {
		mapConfig = {
			base_style_id: ($configStore as StoryMapConfig).base_style_id,
			style_id: ($configStore as StoryMapConfig).style_id,
			style: ($configStore as StoryMapConfig).style
		};
	});

	const handleMapStyleChanged = () => {
		($configStore as StoryMapConfig).base_style_id = mapConfig.base_style_id;
		($configStore as StoryMapConfig).style_id = mapConfig.style_id;
		$configStore.style = mapConfig.style;
		handleChange();
	};
</script>

<div style="width: {width}px;">
	<FloatingPanel
		title="Header slide settings"
		showExpand={false}
		on:close={handleClose}
		bind:headerHeight={panelHeaderHeight}
	>
		<div bind:clientHeight={tabHeight}>
			<Tabs
				bind:tabs
				bind:activeTab
				fontWeight="bold"
				isCapitalized={true}
				isCentered={true}
				isBoxed={false}
				isUppercase={true}
			/>
		</div>

		<div class="editor-container" style="height: {tabContentHeight}px;">
			{#if $configStore}
				<div hidden={activeTab !== 'card'}>
					<Accordion title="Text" bind:isExpanded={expanded['text']}>
						<div slot="content">
							<FieldControl title="Title" showHelp={false}>
								<div slot="control">
									<input
										class="input {!($configStore.title && $configStore.title.length > 0)
											? 'is-danger'
											: ''}"
										type="text"
										bind:value={$configStore.title}
										placeholder="Input title..."
										on:change={handleTextChanged}
									/>
									{#if !($configStore.title && $configStore.title.length > 0)}
										<span class="help is-danger">Please provide the title of your storymap.</span>
									{/if}
								</div>
							</FieldControl>
							<FieldControl title="Subtitle" showHelp={false} showHelpPopup={false}>
								<div slot="control">
									<textarea
										class="textarea"
										rows="4"
										bind:value={$configStore.subtitle}
										placeholder="Input subtitle..."
									></textarea>
								</div>
							</FieldControl>
							<FieldControl title="Note" showHelp={true} showHelpPopup={false}>
								<div slot="control">
									<input
										class="input"
										type="text"
										bind:value={$configStore.byline}
										placeholder="Input additional information such as author name, published date."
									/>
								</div>
								<div slot="help">
									Any additional supporting information such as author name, published date, etc.
								</div>
							</FieldControl>
						</div>
						<div slot="buttons">
							<Help>Type the slide title and subtitle of the story</Help>
						</div>
					</Accordion>
					<Accordion title="Logo" bind:isExpanded={expanded['image']}>
						<div slot="content">
							<ImageUploader bind:dataUrl={$configStore.logo} />
						</div>
						<div slot="buttons">
							<Help>Upload a logo image for the slide header</Help>
						</div>
					</Accordion>
				</div>
				<div hidden={activeTab !== 'map'}>
					<Accordion title="Map style" bind:isExpanded={expanded['map-style']}>
						<div slot="content">
							<StorymapStyleSelector bind:mapConfig on:change={handleMapStyleChanged} />
						</div>
						<div slot="buttons">
							<Help>Choose a default base map style for the storymap</Help>
						</div>
					</Accordion>
				</div>
			{/if}
		</div>
	</FloatingPanel>
</div>

<style lang="scss">
	.editor-container {
		overflow-y: auto;
	}
</style>
