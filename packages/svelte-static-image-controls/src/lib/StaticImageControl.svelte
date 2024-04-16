<script lang="ts">
	import { bounds } from '@placemarkio/geo-viewport';
	import { FieldControl, Notification, SegmentButtons } from '@undp-data/svelte-undp-components';
	import debounce from 'debounce';
	import type { Map } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import { PageSizes, supportedExtensions } from './constants/index.js';
	import { PageOrientations } from './constants/pageOrientations.js';
	import { handleEnterKey, mm2pixel } from './helpers/index.js';
	import type { ControlOptions } from './interface/ControlOptions.ts';

	const dispatch = createEventDispatcher();

	/**
	 * Maplibre Map object
	 */
	export let map: Map;

	/**
	 * If true, show control
	 */
	export let show = false;

	/**
	 * Style JSON URL (optional)
	 */
	export let style: string;

	/**
	 * GeoHub Static Image API URL
	 * https://staticimage.undpgeohub.org/api
	 */
	export let apiBase: string;

	/**
	 * Optional values
	 */
	export let options: ControlOptions = {};

	/**
	 * if enabled, show advanced settings
	 */
	export let showAdvanced = false;

	let previewContainer: HTMLDivElement;

	const defaultOptions: ControlOptions = {
		width: 300,
		height: 200,
		bbox: [-180, -90, 180, 90],
		latitude: 0,
		longitude: 0,
		zoom: 3,
		bearing: 0,
		pitch: 0,
		ratio: 1,
		defaultApi: 'center',
		extension: 'png',
		pageSize: 'custom',
		orientation: 'portrait'
	};

	let width: number;
	let height: number;
	let defaultSize: [number, number];
	let selectedPageName: string;
	let selectedOrientation: 'portrait' | 'landscape';

	let apiUrl: string;

	onMount(() => {
		options = Object.assign(defaultOptions, options);

		if (options.width && options.height) {
			defaultSize = [options.width, options.height];
			width = defaultSize[0];
			height = defaultSize[1];
		}
		if (options.pageSize && PageSizes[options.pageSize]) {
			selectedPageName = options.pageSize;
			width = PageSizes[options.pageSize][0];
			height = PageSizes[options.pageSize][1];
		} else {
			selectedPageName = 'custom';
		}

		selectedOrientation = options.orientation ?? 'portrait';

		map.getContainer().appendChild(previewContainer);
		map.on('moveend', handleMoveend);
		updateApiUrl();
	});

	$: selectedOrientation, handlePageSizeChanged();
	$: selectedPageName, handlePageSizeChanged();
	const handlePageSizeChanged = () => {
		if (!map) return;
		if (selectedPageName in PageSizes) {
			let size = JSON.parse(JSON.stringify(PageSizes[selectedPageName])) as [number, number];
			if (selectedOrientation === 'portrait') {
				size = size.reverse() as [number, number];
			}
			width = mm2pixel(size[0]);
			height = mm2pixel(size[1]);
		} else {
			if (!(defaultSize && defaultSize.length === 2)) return;
			width = defaultSize[0];
			height = defaultSize[1];
		}

		updateApiUrl();
	};

	$: style, handleStyleChanged();
	const handleStyleChanged = () => {
		updateApiUrl();
	};

	const handleMoveend = () => {
		if (!map) return;
		const center = map.getCenter();
		options.longitude = center.lng;
		options.latitude = center.lat;
		options.zoom = map.getZoom();
		options.bearing = options.defaultApi === 'bbox' ? 0 : map.getBearing();
		options.pitch = options.defaultApi === 'bbox' ? 0 : map.getPitch();

		options.bbox = bounds([options.longitude, options.latitude], options.zoom, [width, height]);
		updateApiUrl();
	};

	const updateApiUrl = debounce(() => {
		const fileName = `${width}x${height}.${options.extension}`;

		if (options.defaultApi === 'center') {
			apiUrl = `${apiBase}/style/static/${options.longitude},${options.latitude},${options.zoom},${options.bearing},${options.pitch}/${fileName}`;
		} else if (options.defaultApi === 'bbox') {
			apiUrl = `${apiBase}/style/static/${options.bbox?.join(',')}/${fileName}`;
		} else {
			const styleJson = map.getStyle();
			if (styleJson.center) {
				options.longitude = styleJson.center[0];
				options.latitude = styleJson.center[1];
			} else {
				options.longitude = 0;
				options.latitude = 0;
			}

			options.zoom = styleJson.zoom ?? 0;
			options.bearing = styleJson.bearing ?? 0;
			options.pitch = styleJson.pitch ?? 0;

			map.setCenter([options.longitude, options.latitude], options.zoom);
			map.setBearing(options.bearing);
			map.setPitch(options.pitch);

			apiUrl = `${apiBase}/style/static/auto/${fileName}}`;
		}

		const url = new URL(apiUrl);

		if (style) {
			url.searchParams.set('url', style);
		}

		if (options.ratio) {
			url.searchParams.set('ratio', `${options.ratio}`);
		}

		dispatch('change', {
			url: url.href
		});
	}, 300);

	const handleActiveTabChanged = (tab: 'center' | 'bbox' | 'auto') => {
		options.defaultApi = tab;
		handleMoveend();

		if (options.defaultApi === 'auto') {
			map.scrollZoom.disable();
			map.boxZoom.disable();
			map.dragRotate.disable();
			map.dragPan.disable();
			map.keyboard.disable();
			map.doubleClickZoom.disable();
			map.touchZoomRotate.disable();
			map.touchPitch.disable();
		} else if (options.defaultApi === 'bbox') {
			options.pitch = 0;
			options.bearing = 0;
			map.setBearing(options.bearing);
			map.setPitch(options.pitch);

			map.scrollZoom.enable();
			map.boxZoom.enable();
			map.dragRotate.disable();
			map.dragPan.enable();
			map.keyboard.enable();
			map.doubleClickZoom.enable();
			map.touchZoomRotate.disable();
			map.touchPitch.disable();
		} else {
			map.scrollZoom.enable();
			map.boxZoom.enable();
			map.dragRotate.enable();
			map.dragPan.enable();
			map.keyboard.enable();
			map.doubleClickZoom.enable();
			map.touchZoomRotate.enable();
			map.touchPitch.enable();
		}
	};
</script>

<div class="export-contents">
	<FieldControl
		title="page size"
		showHelp={false}
		isFirstCharCapitalized={true}
		fontWeight="semibold"
	>
		<div slot="control" class="control has-icons-left">
			<div class="select is-fullwidth">
				<select bind:value={selectedPageName}>
					<option value="custom">Custom</option>
					{#each Object.keys(PageSizes) as name}
						{@const size = PageSizes[name]}
						<option value={name}>{name} ({size[0]} mm x {size[1]} mm)</option>
					{/each}
				</select>
			</div>
			<div class="icon is-small is-left">
				<i class="fa-solid fa-file-lines"></i>
			</div>
		</div>
	</FieldControl>

	{#if selectedPageName !== 'custom'}
		{@const orientationButtons = PageOrientations.map((o) => {
			return { title: o, value: o };
		})}
		<FieldControl
			title="Orientation"
			showHelp={false}
			isFirstCharCapitalized={true}
			fontWeight="semibold"
		>
			<div slot="control">
				<SegmentButtons
					size="small"
					capitalized={true}
					fontWeight="semibold"
					buttons={orientationButtons}
					bind:selected={selectedOrientation}
				/>
			</div>
		</FieldControl>
	{/if}

	{#if selectedPageName === 'custom'}
		<div class="is-flex">
			<FieldControl
				title="Width"
				showHelp={false}
				isFirstCharCapitalized={true}
				fontWeight="semibold"
			>
				<div slot="control" class="mr-2">
					<div class="control is-flex is-align-items-center">
						<input
							class="input is-small"
							type="number"
							placeholder="Type width"
							bind:value={width}
							on:change={handleMoveend}
						/>
						<span class="pl-1">px</span>
					</div>
				</div>
			</FieldControl>

			<FieldControl
				title="Height"
				showHelp={false}
				isFirstCharCapitalized={true}
				fontWeight="semibold"
			>
				<div slot="control">
					<div class="control is-flex is-align-items-center">
						<input
							class="input is-small"
							type="number"
							placeholder="Type height"
							bind:value={height}
							on:change={handleMoveend}
						/>
						<span class="pl-1">px</span>
					</div>
				</div>
			</FieldControl>
		</div>
	{/if}

	<FieldControl
		title="High resolution"
		showHelp={false}
		isFirstCharCapitalized={true}
		fontWeight="semibold"
	>
		<div slot="control">
			<SegmentButtons
				size="small"
				capitalized={true}
				fontWeight="semibold"
				buttons={[
					{ title: '@1x', value: 1 },
					{ title: '@2x', value: 2 },
					{ title: '@3x', value: 3 },
					{ title: '@4x', value: 4 }
				]}
				bind:selected={options.ratio}
				on:change={updateApiUrl}
			/>
		</div>
	</FieldControl>

	<span class="is-flex">
		<span class="is-size-6 has-text-weight-bold mr-2 my-auto">Advanced settings</span>
		<div class="buttons has-addons" style="margin-left: auto;">
			<button
				class="button is-small px-2 {showAdvanced ? 'is-success is-selected' : ''}"
				on:click={() => {
					showAdvanced = !showAdvanced;
				}}>Show</button
			>
			<button
				class="button is-small px-2 {!showAdvanced ? 'is-danger is-selected' : ''}"
				on:click={() => {
					showAdvanced = !showAdvanced;
				}}>Hide</button
			>
		</div>
	</span>

	{#if showAdvanced}
		<FieldControl
			title="File extension"
			showHelp={false}
			isFirstCharCapitalized={true}
			fontWeight="semibold"
		>
			<div slot="control">
				<SegmentButtons
					size="small"
					uppercase={true}
					fontWeight="semibold"
					buttons={supportedExtensions.map((e) => {
						return { title: e, value: e };
					})}
					bind:selected={options.extension}
					on:change={updateApiUrl}
				/>
			</div>
		</FieldControl>

		<div
			class="tabs is-toggle is-small is-toggle-rounded is-fullwidth mt-1 mb-2 is-capitalized has-text-weight-semibold"
		>
			<ul>
				<li class={options.defaultApi === 'center' ? 'is-active' : ''}>
					<!-- svelte-ignore a11y-missing-attribute -->
					<!-- svelte-ignore a11y-interactive-supports-focus -->
					<a
						role="tab"
						on:click={() => handleActiveTabChanged('center')}
						on:keydown={handleEnterKey}
						data-sveltekit-preload-data="off"
						data-sveltekit-preload-code="off">center</a
					>
				</li>
				<li class={options.defaultApi === 'bbox' ? 'is-active' : ''}>
					<!-- svelte-ignore a11y-missing-attribute -->
					<!-- svelte-ignore a11y-interactive-supports-focus -->
					<a
						role="tab"
						on:click={() => handleActiveTabChanged('bbox')}
						on:keydown={handleEnterKey}
						data-sveltekit-preload-data="off"
						data-sveltekit-preload-code="off">bounding box</a
					>
				</li>
				<li class={options.defaultApi === 'auto' ? 'is-active' : ''}>
					<!-- svelte-ignore a11y-missing-attribute -->
					<!-- svelte-ignore a11y-interactive-supports-focus -->
					<a
						role="tab"
						on:click={() => handleActiveTabChanged('auto')}
						on:keydown={handleEnterKey}
						data-sveltekit-preload-data="off"
						data-sveltekit-preload-code="off">auto</a
					>
				</li>
			</ul>
		</div>

		<div class="p-1" hidden={options.defaultApi !== 'center'}>
			<div class="is-flex">
				<FieldControl
					title="longitude"
					showHelp={false}
					isFirstCharCapitalized={true}
					fontWeight="semibold"
				>
					<div slot="control">
						<input class="input is-small" type="number" bind:value={options.longitude} readonly />
					</div>
				</FieldControl>
				<FieldControl
					title="latitude"
					showHelp={false}
					isFirstCharCapitalized={true}
					fontWeight="semibold"
				>
					<div slot="control">
						<input class="input is-small" type="number" bind:value={options.latitude} readonly />
					</div>
				</FieldControl>
			</div>

			<div class="is-flex">
				<FieldControl
					title="zoom level"
					showHelp={false}
					isFirstCharCapitalized={true}
					fontWeight="semibold"
				>
					<div slot="control">
						<input class="input is-small" type="number" bind:value={options.zoom} readonly />
					</div>
				</FieldControl>
				<FieldControl
					title="bearing"
					showHelp={false}
					isFirstCharCapitalized={true}
					fontWeight="semibold"
				>
					<div slot="control">
						<input class="input is-small" type="number" bind:value={options.bearing} readonly />
					</div>
				</FieldControl>
				<FieldControl
					title="pitch"
					showHelp={false}
					isFirstCharCapitalized={true}
					fontWeight="semibold"
				>
					<div slot="control">
						<input class="input is-small" type="number" bind:value={options.pitch} readonly />
					</div>
				</FieldControl>
			</div>
		</div>

		<div class="p-1" hidden={options.defaultApi !== 'bbox'}>
			{#if options.bbox}
				{@const bbox = options.bbox}

				<div class="is-flex">
					<FieldControl
						title="min longitude"
						showHelp={false}
						isFirstCharCapitalized={true}
						fontWeight="semibold"
					>
						<div slot="control">
							<input class="input is-small" type="number" value={bbox[0]} readonly />
						</div>
					</FieldControl>

					<FieldControl
						title="max longitude"
						showHelp={false}
						isFirstCharCapitalized={true}
						fontWeight="semibold"
					>
						<div slot="control">
							<input class="input is-small" type="number" value={bbox[2]} readonly />
						</div>
					</FieldControl>
				</div>

				<div class="is-flex">
					<FieldControl
						title="min latitude"
						showHelp={false}
						isFirstCharCapitalized={true}
						fontWeight="semibold"
					>
						<div slot="control">
							<input class="input is-small" type="number" value={bbox[1]} readonly />
						</div>
					</FieldControl>

					<FieldControl
						title="max latitude"
						showHelp={false}
						isFirstCharCapitalized={true}
						fontWeight="semibold"
					>
						<div slot="control">
							<input class="input is-small" type="number" value={bbox[3]} readonly />
						</div>
					</FieldControl>
				</div>
			{/if}
		</div>

		<div class="p-1" hidden={options.defaultApi !== 'auto'}>
			<Notification type="info" showCloseButton={false}>
				Position is automatically determined based on the overlays or the map style’s default center
				coordinates.
			</Notification>
		</div>
	{/if}
</div>

<div
	bind:this={previewContainer}
	class="preview"
	style="width:{width}px; height:{height}px"
	hidden={!show}
/>

<style lang="scss">
	.export-contents {
		width: 300px;
		height: fit-content;
		overflow: hidden;
	}

	.preview {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 10;
		box-shadow: 5px 10px 25px 5px rgba(0, 0, 0, 0.5);
		pointer-events: none;
	}
</style>
