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
		ImageUploader,
		Tabs,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import type { StyleSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import MapLocationSelector from './MapLocationSelector.svelte';
	import StorymapStyleSelector, {
		type StorymapBaseMapConfig
	} from './StorymapStyleSelector.svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	interface Props {
		width?: number;
		height?: number;
		onchange?: () => void;
		onclose?: () => void;
		ontextchange?: () => void;
	}

	let {
		width = $bindable(360),
		height = $bindable(500),
		onchange = () => {},
		onclose = () => {},
		ontextchange = () => {}
	}: Props = $props();

	let tabHeight = $state(0);
	let panelHeaderHeight = $state(0);
	let tabContentHeight = $derived(height - tabHeight - panelHeaderHeight - 30);

	let tabs: Tab[] = $state([
		{ label: 'card', id: 'card' },
		{ label: 'map', id: 'map' }
	]);
	let activeTab = $state('card');

	let mapConfig: StorymapBaseMapConfig = $state({
		base_style_id: ($configStore as StoryMapConfig).base_style_id,
		style_id: ($configStore as StoryMapConfig).style_id,
		style: ($configStore as StoryMapConfig).style,
		hillshade: ($configStore as StoryMapConfig).hillshade,
		terrain: ($configStore as StoryMapConfig).terrain
	});

	let mapLocationSelector: MapLocationSelector | undefined = $state();
	let mapLocationChanged = false;

	const handleChange = () => {
		if (onchange) onchange();
	};

	const handleTextChanged = () => {
		if (ontextchange) ontextchange();
	};

	const handleClose = () => {
		if (onclose) onclose();
	};

	let expanded: { [key: string]: boolean } = $state({ text: true });
	// to allow only an accordion to be expanded
	let expandedId: string = $state('');
	$effect(() => {
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
	});

	onMount(() => {
		mapConfig = {
			base_style_id: ($configStore as StoryMapConfig).base_style_id,
			style_id: ($configStore as StoryMapConfig).style_id,
			style: ($configStore as StoryMapConfig).style,
			hillshade: ($configStore as StoryMapConfig).hillshade,
			terrain: ($configStore as StoryMapConfig).terrain
		};
	});

	const handleMapStyleChanged = () => {
		($configStore as StoryMapConfig).base_style_id = mapConfig.base_style_id;
		($configStore as StoryMapConfig).style_id = mapConfig.style_id;
		$configStore.style = mapConfig.style as string | StyleSpecification;
		($configStore as StoryMapConfig).hillshade = mapConfig.hillshade;
		($configStore as StoryMapConfig).terrain = mapConfig.terrain;
		handleChange();
	};
</script>

<div style="width: {width}px;">
	<FloatingPanel
		title="Header slide settings"
		showExpand={false}
		onclose={handleClose}
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
						{#snippet content()}
							<div>
								<FieldControl title="Title" showHelp={false}>
									{#snippet control()}
										<div>
											<input
												class="input {!($configStore.title && $configStore.title.length > 0)
													? 'is-danger'
													: ''}"
												type="text"
												bind:value={$configStore.title}
												placeholder="Input title..."
												onchange={handleTextChanged}
											/>
											{#if !($configStore.title && $configStore.title.length > 0)}
												<span class="help is-danger"
													>Please provide the title of your storymap.</span
												>
											{/if}
										</div>
									{/snippet}
								</FieldControl>
								<FieldControl title="Subtitle" showHelp={false} showHelpPopup={false}>
									{#snippet control()}
										<div>
											<textarea
												class="textarea"
												rows="4"
												bind:value={$configStore.subtitle}
												placeholder="Input subtitle..."
											></textarea>
										</div>
									{/snippet}
								</FieldControl>
								<FieldControl title="Note" showHelp={true} showHelpPopup={false}>
									{#snippet control()}
										<div>
											<input
												class="input"
												type="text"
												bind:value={$configStore.byline}
												placeholder="Input additional information such as author name, published date."
											/>
										</div>
									{/snippet}
									{#snippet help()}
										<div>
											Any additional supporting information such as author name, published date,
											etc.
										</div>
									{/snippet}
								</FieldControl>
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>Type the slide title and subtitle of the story</Help>
							</div>
						{/snippet}
					</Accordion>
					<Accordion title="Logo" bind:isExpanded={expanded['image']}>
						{#snippet content()}
							<div>
								<ImageUploader
									dataUrl={$configStore.logo}
									onchange={(value) => {
										$configStore.logo = value;
									}}
								/>
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>Upload a logo image for the slide header</Help>
							</div>
						{/snippet}
					</Accordion>
				</div>
				<div hidden={activeTab !== 'map'}>
					<Accordion title="Map style" bind:isExpanded={expanded['map-style']}>
						{#snippet content()}
							<div>
								<StorymapStyleSelector bind:mapConfig onchange={handleMapStyleChanged} />
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>Choose a default base map style for the storymap</Help>
							</div>
						{/snippet}
					</Accordion>
					<Accordion title="Location" bind:isExpanded={expanded['maplocation']}>
						{#snippet content()}
							<div>
								{#key mapLocationChanged}
									<MapLocationSelector onchange={handleChange} bind:this={mapLocationSelector} />
								{/key}
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>Move a pin for the map location of the slide by dragging the map.</Help>
							</div>
						{/snippet}
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
