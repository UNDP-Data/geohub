<script context="module" lang="ts">
	import { writable, type Writable } from 'svelte/store';

	export const ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY = 'active-storymap-chapter-store';
	export type ActiveStorymapChapterStore = Writable<StoryMapChapter | undefined>;
	export const createActiveStorymapChapterStore = () => {
		return writable(<StoryMapChapter | undefined>undefined);
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import type { StoryMapChapter } from '$lib/types';
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from '@undp-data/svelte-maplibre-storymap';
	import {
		Accordion,
		FieldControl,
		FloatingPanel,
		Help,
		SegmentButtons,
		Tabs,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { Switch } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import ImageUploader from './ImageUploader.svelte';
	import MapLocationSelector from './MapLocationSelector.svelte';
	import StorymapChapterLayerEventEditor from './StorymapChapterLayerEventEditor.svelte';
	import StorymapStyleSelector, {
		type StorymapBaseMapConfig
	} from './StorymapStyleSelector.svelte';

	const dispatch = createEventDispatcher();

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	const activeChapterStore: ActiveStorymapChapterStore = getContext(
		ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY
	);

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

	let mapControlPositions = [
		{ title: 'top-left', value: 'top-left' },
		{ title: 'top-right', value: 'top-right' },
		{ title: 'bottom-left', value: 'bottom-left' },
		{ title: 'bottom-right', value: 'bottom-right' }
	];

	let mapConfig: StorymapBaseMapConfig = {
		base_style_id: $activeChapterStore?.base_style_id,
		style_id: $activeChapterStore?.style_id,
		style: $activeChapterStore?.style
	};

	let mapLocationSelector: MapLocationSelector;
	let mapLocationChanged = false;

	let mapInteractive = false;
	let mapAnimation = 'flyTo';
	let rotateAnimation = false;

	let showLegend = true;

	let cardSize: 'default' | 'full' = 'default';

	const handleChange = () => {
		if (!$activeChapterStore) return;
		for (let i = 0; i < $configStore.chapters.length; i++) {
			if ($configStore.chapters[i].id === $activeChapterStore.id) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				$configStore.chapters[i] = $activeChapterStore;
			}
		}
		activeChapterStore.set($activeChapterStore);
		mapLocationSelector.updateMapStyle();
		mapLocationChanged = !mapLocationChanged;
		dispatch('change');
	};

	const handleLayerEventChange = () => {
		if (!$activeChapterStore) return;
		for (let i = 0; i < $configStore.chapters.length; i++) {
			if ($configStore.chapters[i].id === $activeChapterStore.id) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				$configStore.chapters[i] = $activeChapterStore;
			}
		}
		activeChapterStore.set($activeChapterStore);
		mapLocationSelector.updateMapStyle();
		dispatch('change');
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

	const handleMapStyleChanged = () => {
		if (!$activeChapterStore) return;
		$activeChapterStore.base_style_id = mapConfig.base_style_id;
		$activeChapterStore.style_id = mapConfig.style_id;
		$activeChapterStore.style = mapConfig.style;
		if ($activeChapterStore.onChapterEnter) {
			$activeChapterStore.onChapterEnter = undefined;
		}
		for (let i = 0; i < $configStore.chapters.length; i++) {
			if ($configStore.chapters[i].id === $activeChapterStore.id) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				$configStore.chapters[i] = $activeChapterStore;
			}
		}
		activeChapterStore.set($activeChapterStore);
		mapLocationSelector.updateMapStyle();

		dispatch('change');
	};

	const handleCardSizeChange = () => {
		if (!$activeChapterStore) return;
		if (cardSize === 'full') {
			$activeChapterStore.alignment = 'full';
		} else {
			$activeChapterStore.alignment = $page.data.config.StorymapChapterCardAlignment;
		}
		handleChange();
	};

	onMount(() => {
		activeChapterStore.subscribe(() => {
			if ($activeChapterStore) {
				mapInteractive = $activeChapterStore.mapInteractive;
				mapAnimation = $activeChapterStore.mapAnimation;
				rotateAnimation = $activeChapterStore.rotateAnimation;
				showLegend = $activeChapterStore.showLegend;
				cardSize = $activeChapterStore.alignment !== 'full' ? 'default' : 'full';
			}
		});
	});
</script>

<div style="width: {width}px;">
	<FloatingPanel
		title="slide settings"
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
			{#if $activeChapterStore}
				<div hidden={activeTab !== 'card'}>
					<Accordion title="Text" bind:isExpanded={expanded['text']}>
						<div slot="content">
							<FieldControl title="Title" showHelp={false}>
								<div slot="control">
									<input
										class="input"
										type="text"
										bind:value={$activeChapterStore.title}
										placeholder="Input title..."
										on:change={handleChange}
									/>
								</div>
							</FieldControl>
							<FieldControl title="Description" showHelp={false}>
								<div slot="control">
									<textarea
										class="textarea"
										rows="6"
										bind:value={$activeChapterStore.description}
										placeholder="Input description..."
									></textarea>
								</div>
							</FieldControl>
						</div>
						<div slot="buttons">
							<Help>Type the slide title and description</Help>
						</div>
					</Accordion>
					{#if $configStore}
						{@const lastChapter = $configStore.chapters[$configStore.chapters.length - 1]}
						{#if lastChapter.id === $activeChapterStore.id}
							<Accordion title="Footer Text" bind:isExpanded={expanded['footer-text']}>
								<div slot="content">
									<input
										class="input"
										type="text"
										bind:value={$configStore.footer}
										placeholder="Input title..."
									/>
								</div>
								<div slot="buttons">
									<Help>
										<p>
											Type any information to be presented in the last slide of storymap. This can
											be any credit information like copyright.
										</p>

										<p>If you don't want to show any footer, leave it blank.</p>
									</Help>
								</div>
							</Accordion>
						{/if}
					{/if}
					<Accordion title="Image" bind:isExpanded={expanded['image']}>
						<div slot="content">
							<ImageUploader bind:dataUrl={$activeChapterStore.image} on:change={handleChange} />
						</div>
					</Accordion>
					<Accordion title="Card Size and Alignment" bind:isExpanded={expanded['alignment']}>
						<div slot="content">
							<FieldControl title="Choose card size" showHelp={false}>
								<div slot="control">
									<SegmentButtons
										size="normal"
										capitalized={true}
										buttons={[
											{ title: 'Default', value: 'default' },
											{ title: 'Full Width', value: 'full' }
										]}
										bind:selected={cardSize}
										on:change={handleCardSizeChange}
									/>
								</div>
							</FieldControl>
							{#if cardSize === 'default'}
								<FieldControl title="Choose card alignment" showHelp={false}>
									<div slot="control">
										<SegmentButtons
											size="normal"
											capitalized={true}
											buttons={[
												{ title: 'left', value: 'left', icon: 'fa-solid fa-align-left' },
												{ title: 'center', value: 'center', icon: 'fa-solid fa-align-center' },
												{ title: 'right', value: 'right', icon: 'fa-solid fa-align-right' }
											]}
											bind:selected={$activeChapterStore.alignment}
											on:change={handleChange}
										/>
									</div>
								</FieldControl>
							{/if}
						</div>
						<div slot="buttons">
							<Help>Defines where the story text should appear over the map.</Help>
						</div>
					</Accordion>

					<Accordion title="Card visibility" bind:isExpanded={expanded['cardHidden']}>
						<div slot="content">
							<FieldControl title="Hide card content" showHelp={false}>
								<div slot="control">
									<Switch
										bind:toggled={$activeChapterStore.cardHidden}
										on:change={handleChange}
										showValue={false}
									/>
								</div>
							</FieldControl>
						</div>
						<div slot="buttons">
							<Help>
								If enable, the visibility of the card content for this chapter is set to hidden.
							</Help>
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

					<Accordion title="Location" bind:isExpanded={expanded['maplocation']}>
						<div slot="content">
							{#key mapLocationChanged}
								<MapLocationSelector
									bind:chapter={$activeChapterStore}
									on:change={handleChange}
									bind:this={mapLocationSelector}
								/>
							{/key}
						</div>
						<div slot="buttons">
							<Help>Move a pin for the map location of the slide by dragging the map.</Help>
						</div>
					</Accordion>

					<Accordion title="Map controls" bind:isExpanded={expanded['mapInteractive']}>
						<div slot="content">
							<FieldControl title="Enable map to be interactive" showHelp={false}>
								<div slot="control">
									<Switch
										bind:toggled={mapInteractive}
										on:change={() => {
											if (!$activeChapterStore) return;
											$activeChapterStore.mapInteractive = mapInteractive;
											handleChange();
										}}
									/>
								</div>
							</FieldControl>

							{#if $activeChapterStore.mapInteractive}
								<FieldControl title="Select position" showHelp={false} showHelpPopup={false}>
									<div slot="control" class="select is-fullwidth">
										<select
											bind:value={$activeChapterStore.mapNavigationPosition}
											on:change={handleChange}
										>
											{#each mapControlPositions as item}
												<option value={item.value}>{item.title}</option>
											{/each}
										</select>
									</div>
								</FieldControl>
							{/if}
						</div>
						<div slot="buttons">
							<Help>
								If enable, the map navigation tool is shown on the map to allow users to interact
								with map.
							</Help>
						</div>
					</Accordion>

					<Accordion title="Legend" bind:isExpanded={expanded['legend']}>
						<div slot="content">
							<FieldControl title="Show legend" showHelp={false}>
								<div slot="control">
									<Switch
										bind:toggled={showLegend}
										on:change={() => {
											if (!$activeChapterStore) return;
											$activeChapterStore.showLegend = showLegend;
											handleChange();
										}}
									/>
								</div>
							</FieldControl>
							{#if $activeChapterStore.showLegend}
								<FieldControl title="Select position" showHelp={false} showHelpPopup={false}>
									<div slot="control" class="select is-fullwidth">
										<select
											bind:value={$activeChapterStore.legendPosition}
											on:change={handleChange}
										>
											{#each mapControlPositions as item}
												<option value={item.value}>{item.title}</option>
											{/each}
										</select>
									</div>
								</FieldControl>
							{/if}
						</div>
						<div slot="buttons">
							<Help>Settings to show or hide a legend for the slide.</Help>
						</div>
					</Accordion>

					<Accordion title="Slide transition" bind:isExpanded={expanded['mapAnimation']}>
						<div slot="content">
							<FieldControl title="Select transition" showHelp={false}>
								<div slot="control">
									<SegmentButtons
										capitalized={true}
										buttons={[
											{ title: 'fly To', value: 'flyTo' },
											// { title: 'easeTo', value: 'easeTo' },
											{ title: 'instant jump', value: 'jumpTo' }
										]}
										bind:selected={mapAnimation}
										on:change={() => {
											if (!$activeChapterStore) return;
											$activeChapterStore.mapAnimation = mapAnimation;
											handleChange;
										}}
									/>
								</div>
							</FieldControl>
						</div>
						<div slot="buttons">
							<Help>
								Select an animation of transition the slide location on the map when user move to
								this slide. <b>Fly To</b> animate transition along a curve that evokes flight.
								<b>Instant Jump</b> move to the slide instantly without an animated transition.
							</Help>
						</div>
					</Accordion>
					<Accordion title="Rotate animation" bind:isExpanded={expanded['rotateAnimation']}>
						<div slot="content">
							<FieldControl title="Enable rotate animation" showHelp={false}>
								<div slot="control">
									<Switch
										bind:toggled={rotateAnimation}
										on:change={() => {
											if (!$activeChapterStore) return;
											$activeChapterStore.rotateAnimation = rotateAnimation;
											handleChange();
										}}
									/>
								</div>
							</FieldControl>
						</div>
						<div slot="buttons">
							<Help
								>Starts a slow rotation animation at the end of the map transition when set to true.
								The map will rotate 90 degrees over 24 seconds.</Help
							>
						</div>
					</Accordion>
					{#if $activeChapterStore.style_id}
						<Accordion title="Layer Selection" bind:isExpanded={expanded['onChapterEnter']}>
							<div slot="content">
								{#key mapLocationChanged}
									<StorymapChapterLayerEventEditor
										chapterLayerEvent="onChapterEnter"
										on:change={handleLayerEventChange}
									/>
								{/key}
							</div>
							<div slot="buttons">
								<Help>
									You can change layer visibility from the default base map style when users move
									into this slide.
								</Help>
							</div>
						</Accordion>
					{/if}
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
