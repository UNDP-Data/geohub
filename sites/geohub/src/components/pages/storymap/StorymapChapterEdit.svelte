<script lang="ts">
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
	import { createEventDispatcher, getContext } from 'svelte';
	import ImageUploader from './ImageUploader.svelte';
	import MapLocationSelector from './MapLocationSelector.svelte';
	import StorymapChapterLayerEventEditor from './StorymapChapterLayerEventEditor.svelte';
	import StorymapStyleSelector, {
		type StorymapBaseMapConfig
	} from './StorymapStyleSelector.svelte';

	const dispatch = createEventDispatcher();

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	export let chapter: StoryMapChapter;
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
		base_style_id: chapter.base_style_id,
		style_id: chapter.style_id,
		style: chapter.style
	};

	let mapLocationSelector: MapLocationSelector;

	const handleChange = () => {
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

	$: chapter, mapLocationSelector?.updateMapStyle();

	const handleMapStyleChanged = () => {
		chapter.base_style_id = mapConfig.base_style_id;
		chapter.style_id = mapConfig.style_id;
		chapter.style = mapConfig.style;
		mapLocationSelector.updateMapStyle();
		handleChange();
	};
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
			{#if chapter}
				<div hidden={activeTab !== 'card'}>
					<Accordion title="Text" bind:isExpanded={expanded['text']}>
						<div slot="content">
							<FieldControl title="Title" showHelp={false}>
								<div slot="control">
									<input
										class="input"
										type="text"
										bind:value={chapter.title}
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
										bind:value={chapter.description}
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
						{#if lastChapter.id === chapter.id}
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
							<ImageUploader bind:dataUrl={chapter.image} on:change={handleChange} />
						</div>
						<div slot="buttons">
							<Help>Upload an image for the slide</Help>
						</div>
					</Accordion>
					<Accordion title="Card Alignment" bind:isExpanded={expanded['alignment']}>
						<div slot="content">
							<SegmentButtons
								size="small"
								capitalized={true}
								fontWeight="semibold"
								buttons={[
									{ title: 'left', value: 'left', icon: 'fa-solid fa-align-left' },
									{ title: 'center', value: 'center', icon: 'fa-solid fa-align-center' },
									{ title: 'right', value: 'right', icon: 'fa-solid fa-align-right' },
									{ title: 'full', value: 'full', icon: 'fa-solid fa-arrows-left-right-to-line' }
								]}
								bind:selected={chapter.alignment}
								on:change={handleChange}
							/>
						</div>
						<div slot="buttons">
							<Help>Defines where the story text should appear over the map.</Help>
						</div>
					</Accordion>

					<Accordion title="Card hidden" bind:isExpanded={expanded['cardHidden']}>
						<div slot="content">
							<Switch
								bind:toggled={chapter.cardHidden}
								on:change={handleChange}
								showValue={true}
								toggledText="Hide card content"
								untoggledText="Show card content"
							/>
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
							<MapLocationSelector
								bind:chapter
								on:change={handleChange}
								bind:this={mapLocationSelector}
							/>
						</div>
						<div slot="buttons">
							<Help>Move a pin for the map location of the slide by dragging the map.</Help>
						</div>
					</Accordion>

					<Accordion title="Map controls" bind:isExpanded={expanded['mapInteractive']}>
						<div slot="content">
							<FieldControl title="Enable map to be interactive" showHelp={false}>
								<div slot="control">
									<Switch bind:toggled={chapter.mapInteractive} on:change={handleChange} />
								</div>
							</FieldControl>

							{#if chapter.mapInteractive}
								<FieldControl title="Select position" showHelp={false} showHelpPopup={false}>
									<div slot="control" class="select is-fullwidth">
										<select bind:value={chapter.mapNavigationPosition} on:change={handleChange}>
											{#each [{ title: 'top-left', value: 'top-left' }, { title: 'top-right', value: 'top-right' }, { title: 'bottom-left', value: 'bottom-left' }, { title: 'bottom-right', value: 'bottom-right' }] as item}
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
					<Accordion title="Slide transition" bind:isExpanded={expanded['mapAnimation']}>
						<div slot="content">
							<FieldControl title="Select transition" showHelp={false}>
								<div slot="control">
									<SegmentButtons
										capitalized={true}
										fontWeight="semibold"
										buttons={[
											{ title: 'fly To', value: 'flyTo' },
											// { title: 'easeTo', value: 'easeTo' },
											{ title: 'instant jump', value: 'jumpTo' }
										]}
										bind:selected={chapter.mapAnimation}
										on:change={handleChange}
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
									<Switch bind:toggled={chapter.rotateAnimation} on:change={handleChange} />
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
					{#if chapter.style_id}
						<Accordion
							title="Layer visibility on slide enter"
							bind:isExpanded={expanded['onChapterEnter']}
						>
							<div slot="content">
								<StorymapChapterLayerEventEditor
									bind:style={chapter.style}
									bind:styleId={chapter.style_id}
									bind:chapterLayerEvent={chapter.onChapterEnter}
									on:change={handleChange}
								/>
							</div>
							<div slot="buttons">
								<Help>
									You can change layer visibility from the default base map style when users move
									into this slide.
								</Help>
							</div>
						</Accordion>
						<Accordion
							title="Layer visibility on slide exit"
							bind:isExpanded={expanded['onChapterExit']}
						>
							<div slot="content">
								<StorymapChapterLayerEventEditor
									bind:style={chapter.style}
									bind:styleId={chapter.style_id}
									bind:chapterLayerEvent={chapter.onChapterExit}
									on:change={handleChange}
								/>
							</div>
							<div slot="buttons">
								<Help>
									You can change layer visibility from the default base map style when users is
									leaving this slide.
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
