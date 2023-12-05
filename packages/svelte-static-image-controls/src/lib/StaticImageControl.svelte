<script lang="ts">
	import { bounds } from '@placemarkio/geo-viewport';
	import debounce from 'debounce';
	import type { Map } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import { supportedExtensions } from './constants/index.ts';
	import { handleEnterKey } from './helpers/index.ts';
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
	 * If true, show coordinates info below tabs. Coordinates will be toggled by double clicking tabs.
	 */
	export let showCoordinates = true;

	/**
	 * Optional values
	 */
	export let options: ControlOptions = {};

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
		retina: false,
		defaultApi: 'center',
		extension: 'png'
	};

	let apiUrl: string;

	onMount(() => {
		options = Object.assign(defaultOptions, options);

		map.getContainer().appendChild(previewContainer);
		map.on('moveend', handleMoveend);
		updateApiUrl();
	});

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
		options.bearing = map.getBearing();
		options.pitch = map.getPitch();

		const width = options.width as number;
		const height = options.height as number;
		options.bbox = bounds([options.longitude, options.latitude], options.zoom, [width, height]);
		updateApiUrl();
	};

	const updateApiUrl = debounce(() => {
		const width = options.width as number;
		const height = options.height as number;

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

		if (options.retina) {
			url.searchParams.set('ratio', `2`);
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
			map.scrollZoom.enable();
			map.boxZoom.enable();
			map.dragRotate.disable();
			map.dragPan.enable();
			map.keyboard.enable();
			map.doubleClickZoom.enable();
			map.touchZoomRotate.disable();
			map.touchPitch.disable();

			options.pitch = 0;
			options.bearing = 0;
			map.setBearing(options.bearing);
			map.setPitch(options.pitch);
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
	<div class="is-flex">
		<div class="field m-1">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Width</label>
			<div class="control">
				<input
					class="input is-small"
					type="number"
					placeholder="Type width"
					bind:value={options.width}
					on:change={handleMoveend}
				/>
			</div>
		</div>
		<div class="field m-1">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Height</label>
			<div class="control">
				<input
					class="input is-small"
					type="number"
					placeholder="Type height"
					bind:value={options.height}
					on:change={handleMoveend}
				/>
			</div>
		</div>
	</div>

	<div class="tabs is-toggle is-toggle-rounded is-fullwidth mt-1 mb-2">
		<ul>
			<li class={options.defaultApi === 'center' ? 'is-active' : ''}>
				<!-- svelte-ignore a11y-missing-attribute -->
				<!-- svelte-ignore a11y-interactive-supports-focus -->
				<a
					role="tab"
					on:click={() => handleActiveTabChanged('center')}
					on:dblclick={() => {
						showCoordinates = !showCoordinates;
					}}
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
					on:dblclick={() => {
						showCoordinates = !showCoordinates;
					}}
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
					on:dblclick={() => {
						showCoordinates = !showCoordinates;
					}}
					on:keydown={handleEnterKey}
					data-sveltekit-preload-data="off"
					data-sveltekit-preload-code="off">auto</a
				>
			</li>
		</ul>
	</div>

	<div hidden={!showCoordinates}>
		<div class="p-1" hidden={options.defaultApi !== 'center'}>
			<div class="is-flex">
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">longitude</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={options.longitude} readonly />
					</div>
				</div>
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">latitude</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={options.latitude} readonly />
					</div>
				</div>
			</div>

			<div class="is-flex">
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">zoom level</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={options.zoom} readonly />
					</div>
				</div>

				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">bearing</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={options.bearing} readonly />
					</div>
				</div>

				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">pitch</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={options.pitch} readonly />
					</div>
				</div>
			</div>
		</div>

		<div class="p-1" hidden={options.defaultApi !== 'bbox'}>
			{#if options.bbox}
				{@const bbox = options.bbox}

				<div class="is-flex">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">min longitude</label>
						<div class="control">
							<input class="input is-small" type="number" value={bbox[0]} readonly />
						</div>
					</div>
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">max longitude</label>
						<div class="control">
							<input class="input is-small" type="number" value={bbox[1]} readonly />
						</div>
					</div>
				</div>

				<div class="is-flex">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">min latitude</label>
						<div class="control">
							<input class="input is-small" type="number" value={bbox[2]} readonly />
						</div>
					</div>
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">max latitude</label>
						<div class="control">
							<input class="input is-small" type="number" value={bbox[3]} readonly />
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="p-1" hidden={options.defaultApi !== 'auto'}>
			<article class="message is-info">
				<div class="message-body">
					Position is automatically determined based on the overlays or the map style’s default
					center coordinates.
				</div>
			</article>
		</div>
	</div>

	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">High resolution</label>
		<div class="control">
			<label class="checkbox">
				<input type="checkbox" bind:checked={options.retina} on:change={updateApiUrl} />
				@2x
			</label>
		</div>
	</div>

	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">File extension</label>
		<div class="control">
			<div class="buttons has-addons is-left">
				{#each supportedExtensions as ext}
					<button
						class="button {options.extension === ext ? 'is-link' : ''}"
						on:click={() => {
							options.extension = ext;
							updateApiUrl();
						}}>{ext}</button
					>
				{/each}
			</div>
		</div>
	</div>
</div>
<!-- </div> -->

<div
	bind:this={previewContainer}
	class="preview"
	style="width:{options.width}px; height:{options.height}px"
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
