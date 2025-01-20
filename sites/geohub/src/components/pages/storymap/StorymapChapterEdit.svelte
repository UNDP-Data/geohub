<script lang="ts">
	import { page } from '$app/state';
	import { ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY, type ActiveStorymapChapterStore } from '$stores';
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
	import { getContext, onMount } from 'svelte';
	import ImageUploader from './ImageUploader.svelte';
	import MapLocationSelector from './MapLocationSelector.svelte';
	import MarkdownEditor from './MarkdownEditor.svelte';
	import StorymapChapterLayerEventEditor from './StorymapChapterLayerEventEditor.svelte';
	import StorymapStyleSelector, {
		type StorymapBaseMapConfig
	} from './StorymapStyleSelector.svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	const activeChapterStore: ActiveStorymapChapterStore = getContext(
		ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY
	);

	interface Props {
		width?: number;
		height?: number;
		onchange?: () => void;
		onclose?: () => void;
	}

	let {
		width = $bindable(360),
		height = $bindable(500),
		onchange = () => {},
		onclose = () => {}
	}: Props = $props();

	let tabHeight = $state(0);
	let panelHeaderHeight = $state(0);
	let tabContentHeight = $derived(height - tabHeight - panelHeaderHeight - 30);

	let tabs: Tab[] = $state([
		{ label: 'card', id: 'card' },
		{ label: 'map', id: 'map' }
	]);
	let activeTab = $state('card');

	let mapControlPositions = [
		{ title: 'top-left', value: 'top-left' },
		{ title: 'top-right', value: 'top-right' },
		{ title: 'bottom-left', value: 'bottom-left' },
		{ title: 'bottom-right', value: 'bottom-right' }
	];

	let mapConfig: StorymapBaseMapConfig = $state({
		base_style_id: $activeChapterStore?.base_style_id,
		style_id: $activeChapterStore?.style_id,
		style: $activeChapterStore?.style,
		hillshade: $activeChapterStore?.hillshade,
		terrain: $activeChapterStore?.terrain
	});

	let mapLocationSelector: MapLocationSelector | undefined = $state();
	let mapLocationChanged = $state(false);

	let mapInteractive = $state(false);
	let mapAnimation = $state('flyTo');
	let rotateAnimation = $state(false);

	let showLegend = $state(true);

	let cardSize: 'default' | 'full' = $state('default');

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
		mapLocationSelector?.updateMapStyle();
		mapLocationChanged = !mapLocationChanged;
		if (onchange) onchange();
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
		mapLocationSelector?.updateMapStyle();
		if (onchange) onchange();
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

	const handleMapStyleChanged = () => {
		if (!$activeChapterStore) return;
		$activeChapterStore.base_style_id = mapConfig.base_style_id;
		$activeChapterStore.style_id = mapConfig.style_id;
		$activeChapterStore.style = mapConfig.style;
		$activeChapterStore.hillshade = mapConfig.hillshade;
		$activeChapterStore.terrain = mapConfig.terrain;
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
		mapLocationSelector?.updateMapStyle();

		if (onchange) onchange();
	};

	const handleCardSizeChange = () => {
		if (!$activeChapterStore) return;
		if (cardSize === 'full') {
			$activeChapterStore.alignment = 'full';
		} else {
			$activeChapterStore.alignment = page.data.config.StorymapChapterCardAlignment;
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
						{#snippet content()}
							<div>
								<FieldControl title="Title" showHelp={false}>
									{#snippet control()}
										<div>
											<input
												class="input"
												type="text"
												bind:value={$activeChapterStore.title}
												placeholder="Input title..."
												onchange={handleChange}
											/>
										</div>
									{/snippet}
								</FieldControl>
								<FieldControl title="Description" showHelp={false}>
									{#snippet control()}
										<div>
											{#key activeTab}
												<MarkdownEditor bind:value={$activeChapterStore.description} />
											{/key}
										</div>
									{/snippet}
								</FieldControl>
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>Type the slide title and description</Help>
							</div>
						{/snippet}
					</Accordion>

					<Accordion title="Image" bind:isExpanded={expanded['image']}>
						{#snippet content()}
							<div>
								<ImageUploader bind:dataUrl={$activeChapterStore.image} onchange={handleChange} />
							</div>
						{/snippet}
					</Accordion>
					<Accordion
						title="Card Size and Alignment"
						isUppercase={false}
						bind:isExpanded={expanded['alignment']}
					>
						{#snippet content()}
							<div>
								<FieldControl title="Choose card size" showHelp={false}>
									{#snippet control()}
										<div>
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
									{/snippet}
								</FieldControl>
								{#if cardSize === 'default'}
									<FieldControl title="Choose card alignment" showHelp={false}>
										{#snippet control()}
											<div>
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
										{/snippet}
									</FieldControl>
								{/if}
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>Defines where the story text should appear over the map.</Help>
							</div>
						{/snippet}
					</Accordion>

					<Accordion title="Card visibility" bind:isExpanded={expanded['cardHidden']}>
						{#snippet content()}
							<div>
								<FieldControl title="Hide card content" showHelp={false}>
									{#snippet control()}
										<div>
											<Switch
												bind:toggled={$activeChapterStore.cardHidden}
												on:change={handleChange}
												showValue={false}
											/>
										</div>
									{/snippet}
								</FieldControl>
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>
									If enable, the visibility of the card content for this chapter is set to hidden.
								</Help>
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
									<MapLocationSelector
										bind:chapter={$activeChapterStore}
										onchange={handleChange}
										bind:this={mapLocationSelector}
									/>
								{/key}
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>Move a pin for the map location of the slide by dragging the map.</Help>
							</div>
						{/snippet}
					</Accordion>

					<Accordion title="Map controls" bind:isExpanded={expanded['mapInteractive']}>
						{#snippet content()}
							<div>
								<FieldControl title="Enable map to be interactive" showHelp={false}>
									{#snippet control()}
										<div>
											<Switch
												bind:toggled={mapInteractive}
												on:change={() => {
													if (!$activeChapterStore) return;
													$activeChapterStore.mapInteractive = mapInteractive;
													handleChange();
												}}
											/>
										</div>
									{/snippet}
								</FieldControl>

								{#if $activeChapterStore.mapInteractive}
									<FieldControl title="Select position" showHelp={false} showHelpPopup={false}>
										{#snippet control()}
											<div class="select is-fullwidth">
												<select
													bind:value={$activeChapterStore.mapNavigationPosition}
													onchange={handleChange}
												>
													{#each mapControlPositions as item}
														<option value={item.value}>{item.title}</option>
													{/each}
												</select>
											</div>
										{/snippet}
									</FieldControl>
								{/if}
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>
									If enable, the map navigation tool is shown on the map to allow users to interact
									with map.
								</Help>
							</div>
						{/snippet}
					</Accordion>

					<Accordion title="Legend" bind:isExpanded={expanded['legend']}>
						{#snippet content()}
							<div>
								<FieldControl title="Show legend" showHelp={false}>
									{#snippet control()}
										<div>
											<Switch
												bind:toggled={showLegend}
												on:change={() => {
													if (!$activeChapterStore) return;
													$activeChapterStore.showLegend = showLegend;
													handleChange();
												}}
											/>
										</div>
									{/snippet}
								</FieldControl>
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>Settings to show or hide a legend for the slide.</Help>
							</div>
						{/snippet}
					</Accordion>

					<Accordion title="Slide transition" bind:isExpanded={expanded['mapAnimation']}>
						{#snippet content()}
							<div>
								<FieldControl title="Select transition" showHelp={false}>
									{#snippet control()}
										<div>
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
									{/snippet}
								</FieldControl>
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help>
									Select an animation of transition the slide location on the map when user move to
									this slide. <b>Fly To</b> animate transition along a curve that evokes flight.
									<b>Instant Jump</b> move to the slide instantly without an animated transition.
								</Help>
							</div>
						{/snippet}
					</Accordion>
					<Accordion title="Rotate animation" bind:isExpanded={expanded['rotateAnimation']}>
						{#snippet content()}
							<div>
								<FieldControl title="Enable rotate animation" showHelp={false}>
									{#snippet control()}
										<div>
											<Switch
												bind:toggled={rotateAnimation}
												on:change={() => {
													if (!$activeChapterStore) return;
													$activeChapterStore.rotateAnimation = rotateAnimation;
													handleChange();
												}}
											/>
										</div>
									{/snippet}
								</FieldControl>
							</div>
						{/snippet}
						{#snippet buttons()}
							<div>
								<Help
									>Starts a slow rotation animation at the end of the map transition when set to
									true. The map will rotate 90 degrees over 24 seconds.</Help
								>
							</div>
						{/snippet}
					</Accordion>
					{#if $activeChapterStore.style_id}
						<Accordion title="Layer Selection" bind:isExpanded={expanded['onChapterEnter']}>
							{#snippet content()}
								<div>
									{#key mapLocationChanged}
										<StorymapChapterLayerEventEditor
											chapterLayerEvent="onChapterEnter"
											onchange={handleLayerEventChange}
										/>
									{/key}
								</div>
							{/snippet}
							{#snippet buttons()}
								<div>
									<Help>
										You can change layer visibility from the default base map style when users move
										into this slide.
									</Help>
								</div>
							{/snippet}
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
