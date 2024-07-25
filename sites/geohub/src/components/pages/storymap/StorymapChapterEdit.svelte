<script lang="ts">
	import type { StoryMapChapter } from '$lib/types';
	import {
		Accordion,
		FieldControl,
		FloatingPanel,
		Help,
		SegmentButtons,
		Tabs,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { Map, Marker, NavigationControl } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import ImageUploader from './ImageUploader.svelte';
	import StorymapChapterLayerEventEditor from './StorymapChapterLayerEventEditor.svelte';
	import StorymapStyleSelector, {
		type StorymapBaseMapConfig
	} from './StorymapStyleSelector.svelte';

	const dispatch = createEventDispatcher();

	export let chapter: StoryMapChapter;
	export let width = 360;
	export let height = 500;

	let tabHeight = 0;
	let panelHeaderHeight: 0;
	$: tabContentHeight = height - tabHeight - panelHeaderHeight - 30;

	let tabs: Tab[] = [
		{ label: 'content', id: 'content' },
		{ label: 'map', id: 'map' }
	];
	let activeTab = tabs[0].id;

	let mapConfig: StorymapBaseMapConfig = {
		base_style_id: chapter.base_style_id,
		style_id: chapter.style_id,
		style: chapter.style
	};

	let locationMapContainer: HTMLDivElement;
	let locationMap: Map;
	let locationMarker: Marker;
	let tempLocation: { center: [number, number]; zoom: number; bearing: number; pitch: number };

	const handleChange = () => {
		dispatch('change');
	};

	const handleClose = () => {
		dispatch('close');
	};

	let expanded: { [key: string]: boolean } = { content: true };
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
		if (!locationMapContainer) return;
		mapConfig = {
			base_style_id: chapter.base_style_id,
			style_id: chapter.style_id,
			style: chapter.style
		};

		locationMap = new Map({
			container: locationMapContainer,
			style: chapter.style,
			attributionControl: false
		});
		locationMap.addControl(
			new NavigationControl({ visualizePitch: true, showCompass: true }),
			'bottom-right'
		);

		locationMap.once('load', updateMapStyle);

		locationMap.on('move', updateMarkerPosition);
		locationMap.on('pitchend', updateMarkerPosition);
	});

	$: chapter, updateMapStyle();
	const updateMapStyle = debounce(() => {
		if (!locationMap) return;
		if (!chapter) return;

		locationMap.setBearing(chapter.location.bearing);
		locationMap.setPitch(chapter.location.pitch);

		const location = { zoom: chapter.location.zoom, center: chapter.location.center };
		locationMap.jumpTo(location);

		tempLocation = JSON.parse(JSON.stringify(chapter.location));

		locationMap.setStyle(chapter.style);
	});

	const updateMarkerPosition = debounce(() => {
		if (!locationMap) return;
		if (!chapter) return;
		if (!tempLocation) {
			tempLocation = JSON.parse(JSON.stringify(chapter.location));
		}

		const lngLat = locationMap.getCenter();

		tempLocation.center = [lngLat.lng, lngLat.lat];
		tempLocation.zoom = locationMap.getZoom();
		tempLocation.bearing = locationMap.getBearing();
		tempLocation.pitch = locationMap.getPitch();

		if (!locationMarker) {
			locationMarker = new Marker().setLngLat(tempLocation.center).addTo(locationMap);
		} else {
			locationMarker.setLngLat(tempLocation.center);
		}
	}, 300);

	const handleMapStyleChanged = () => {
		chapter.base_style_id = mapConfig.base_style_id;
		chapter.style_id = mapConfig.style_id;
		chapter.style = mapConfig.style;
		updateMapStyle();
		handleChange();
	};

	const applyMarkerPosition = () => {
		chapter.location = tempLocation;
		handleChange();
	};

	const resetMarkerPosition = () => {
		if (!locationMap) return;
		if (!chapter) return;

		if (tempLocation.center !== chapter.location.center) {
			locationMap.setCenter(chapter.location.center);
			locationMap.setZoom(chapter.location.zoom);
			tempLocation.center = chapter.location;
		}

		if (tempLocation.bearing !== chapter.location.bearing) {
			locationMap.setBearing(chapter.location.bearing);
			tempLocation.bearing = chapter.location.bearing;
		}

		if (tempLocation.pitch !== chapter.location.pitch) {
			locationMap.setPitch(chapter.location.pitch);
			tempLocation.pitch = chapter.location.pitch;
		}
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
				fontWeight="semibold"
				isCapitalized={true}
				isCentered={true}
				isBoxed={false}
				isUppercase={false}
			/>
		</div>

		<div class="editor-container" style="height: {tabContentHeight}px;">
			{#if chapter}
				<div hidden={activeTab !== 'content'}>
					<Accordion title="Slide content" bind:isExpanded={expanded['content']}>
						<div slot="content">
							<FieldControl title="Title" showHelp={false}>
								<div slot="control">
									<input
										class="input"
										type="text"
										bind:value={chapter.title}
										placeholder="Input title..."
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
					<Accordion title="Image" bind:isExpanded={expanded['image']}>
						<div slot="content">
							<FieldControl title="Image" showHelp={false}>
								<div slot="control">
									<ImageUploader bind:dataUrl={chapter.image} />
								</div>
							</FieldControl>

							<FieldControl title="Image alignment" showHelp={false}>
								<div slot="control">
									<SegmentButtons
										size="small"
										capitalized={true}
										fontWeight="semibold"
										buttons={[
											{ title: 'left', value: 'left', icon: 'fa-solid fa-align-left' },
											{ title: 'center', value: 'center', icon: 'fa-solid fa-align-center' },
											{ title: 'right', value: 'right', icon: 'fa-solid fa-align-right' }
										]}
										bind:selected={chapter.imageAlignment}
										on:change={handleChange}
									/>
								</div>
							</FieldControl>
						</div>
						<div slot="buttons">
							<Help>Upload an image for the slide</Help>
						</div>
					</Accordion>
					<Accordion title="Alignment" bind:isExpanded={expanded['alignment']}>
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
					<Accordion title="Hidden" bind:isExpanded={expanded['hidden']}>
						<div slot="content">
							<input
								id="hide-slide"
								type="checkbox"
								class="switch"
								bind:checked={chapter.hidden}
								on:change={handleChange}
							/>
							<label class="pb-1" for="hide-slide">Hide this slide</label>
						</div>
						<div slot="buttons">
							<Help>You can hide the slide temporally if it is enabled</Help>
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

					<Accordion title="Map location" bind:isExpanded={expanded['maplocation']}>
						<div slot="content">
							<div class="map" bind:this={locationMapContainer} />

							{#if tempLocation}
								{@const resetDisabled =
									JSON.stringify(tempLocation) === JSON.stringify(chapter.location)}
								<div class="columns mt-2 mx-1">
									<div class="column is-6 p-0 pr-1">
										<FieldControl title="Longitude" showHelp={false}>
											<div slot="control">
												<input
													class="input is-small"
													type="text"
													bind:value={tempLocation.center[0]}
													readonly
												/>
											</div>
										</FieldControl>
									</div>
									<div class="column is-6 p-0">
										<FieldControl title="Latitude" showHelp={false}>
											<div slot="control">
												<input
													class="input is-small"
													type="text"
													bind:value={tempLocation.center[1]}
													readonly
												/>
											</div>
										</FieldControl>
									</div>
								</div>
								<div class="columns mt-2 mb-4 mx-1">
									<div class="column is-4 p-0 pr-1">
										<FieldControl title="Zoom" showHelp={false}>
											<div slot="control">
												<input
													class="input is-small"
													type="text"
													bind:value={tempLocation.zoom}
													readonly
												/>
											</div>
										</FieldControl>
									</div>
									<div class="column is-4 p-0 pr-1">
										<FieldControl title="Bearing" showHelp={false}>
											<div slot="control">
												<input
													class="input is-small"
													type="text"
													bind:value={tempLocation.bearing}
													readonly
												/>
											</div>
										</FieldControl>
									</div>
									<div class="column is-4 p-0">
										<FieldControl title="Pitch" showHelp={false}>
											<div slot="control">
												<input
													class="input is-small"
													type="text"
													bind:value={tempLocation.pitch}
													readonly
												/>
											</div>
										</FieldControl>
									</div>
								</div>

								<div>
									<button
										class="button is-link"
										disabled={resetDisabled}
										on:click={applyMarkerPosition}>Apply to slide</button
									>
									<button class="button" disabled={resetDisabled} on:click={resetMarkerPosition}
										>Reset to default</button
									>
								</div>
							{/if}
						</div>
						<div slot="buttons">
							<Help>Move a pin for the map location of the slide by dragging the map.</Help>
						</div>
					</Accordion>

					<Accordion title="Map interactive" bind:isExpanded={expanded['mapInteractive']}>
						<div slot="content">
							<input
								id="map-interactive"
								type="checkbox"
								class="switch"
								bind:checked={chapter.mapInteractive}
								on:change={handleChange}
							/>
							<label class="pb-1" for="map-interactive">Enable map to be interactive</label>

							{#if chapter.mapInteractive}
								<FieldControl
									title="Navigation control position"
									showHelp={true}
									showHelpPopup={false}
								>
									<div slot="control" class="select is-fullwidth">
										<select bind:value={chapter.mapNavigationPosition} on:change={handleChange}>
											{#each [{ title: 'top-left', value: 'top-left' }, { title: 'top-right', value: 'top-right' }, { title: 'bottom-left', value: 'bottom-left' }, { title: 'bottom-right', value: 'bottom-right' }] as item}
												<option value={item.value}>{item.title}</option>
											{/each}
										</select>
									</div>

									<div slot="help">Select a position to show map navigation control.</div>
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
					<Accordion title="Map animation" bind:isExpanded={expanded['mapAnimation']}>
						<div slot="content">
							<SegmentButtons
								size="small"
								capitalized={true}
								fontWeight="semibold"
								buttons={[
									{ title: 'flyTo', value: 'flyTo' },
									{ title: 'easeTo', value: 'easeTo' },
									{ title: 'jumpTo', value: 'jumpTo' }
								]}
								bind:selected={chapter.mapAnimation}
								on:change={handleChange}
							/>
						</div>
						<div slot="buttons">
							<Help>
								Select an animation to zoom into the slide location on the map when user move to
								this slide
							</Help>
						</div>
					</Accordion>
					<Accordion title="Rotate animation" bind:isExpanded={expanded['rotateAnimation']}>
						<div slot="content">
							<input
								id="rotate-animation"
								type="checkbox"
								class="switch"
								bind:checked={chapter.rotateAnimation}
								on:change={handleChange}
							/>
							<label class="pb-1" for="rotate-animation">Enable rotate animation</label>
						</div>
						<div slot="buttons">
							<Help
								>Starts a slow rotation animation at the end of the map transition when set to true.
								The map will rotate 90 degrees over 24 seconds.</Help
							>
						</div>
					</Accordion>
					<Accordion title="Spin Globe" bind:isExpanded={expanded['spinGlobe']}>
						<div slot="content">
							<input
								id="spin-globe"
								type="checkbox"
								class="switch"
								bind:checked={chapter.spinGlobe}
								on:change={handleChange}
							/>
							<label class="pb-1" for="spin-globe">Enable spin globe</label>
						</div>
						<div slot="buttons">
							<Help
								>Start spinning globe anitation. The map will rotate 360 degrees over 20 seconds.</Help
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
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.map {
		width: 100%;
		height: 250px;
		border: 1px solid #d4d6d8;
		border-top: none;
	}

	.editor-container {
		overflow-y: auto;
	}
</style>
