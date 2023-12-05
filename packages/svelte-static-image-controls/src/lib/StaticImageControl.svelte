<script lang="ts">
	import { bounds } from '@placemarkio/geo-viewport';
	import debounce from 'debounce';
	import type { Map } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	import { handleEnterKey } from './helpers/index.ts';

	const dispatch = createEventDispatcher();

	export let map: Map;
	export let show = false;
	export let style: string;
	export let apiBase: string;
	export let showCoordinates = true;

	let apiUrl: string;

	let previewContainer: HTMLDivElement;

	let width = 300;
	let height = 200;
	let bbox: [number, number, number, number] = [-180, -90, 180, 90];
	let latitude = 0;
	let longitude = 0;
	let zoom = 3;
	let bearing = 0;
	let pitch = 0;
	let isRetina = false;

	let activeTab: 'center' | 'bbox' | 'auto' = 'center';
	let supportedExtensions = ['jpeg', 'png', 'webp'];
	let extension = 'png';

	onMount(() => {
		map.getContainer().appendChild(previewContainer);
		map.on('moveend', handleMoveend);
		updateApiUrl();
	});

	$: style, handleStyleChanged();
	const handleStyleChanged = () => {
		updateApiUrl();
	};

	$: width, handleMoveend();
	$: height, handleMoveend();
	$: activeTab, handleMoveend();

	const handleMoveend = () => {
		if (!map) return;
		const center = map.getCenter();
		longitude = center.lng;
		latitude = center.lat;
		zoom = map.getZoom();
		bearing = map.getBearing();
		pitch = map.getPitch();
		bbox = bounds([longitude, latitude], zoom, [width, height]);
		updateApiUrl();
	};

	$: isRetina, updateApiUrl();
	$: extension, updateApiUrl();

	const updateApiUrl = debounce(() => {
		const fileName = `${width}x${height}.${extension}`;

		if (activeTab === 'center') {
			apiUrl = `${apiBase}/style/static/${longitude},${latitude},${zoom},${bearing},${pitch}/${fileName}`;
		} else if (activeTab === 'bbox') {
			apiUrl = `${apiBase}/style/static/${bbox.join(',')}/${fileName}`;
		} else {
			const styleJson = map.getStyle();
			if (styleJson.center) {
				longitude = styleJson.center[0];
				latitude = styleJson.center[1];
			} else {
				longitude = 0;
				latitude = 0;
			}

			zoom = styleJson.zoom ?? 0;
			bearing = styleJson.bearing ?? 0;
			pitch = styleJson.pitch ?? 0;

			map.setCenter([longitude, latitude], zoom);
			map.setBearing(bearing);
			map.setPitch(bearing);

			apiUrl = `${apiBase}/style/static/auto/${fileName}}`;
		}

		const url = new URL(apiUrl);

		if (style) {
			url.searchParams.set('url', style);
		}

		if (isRetina) {
			url.searchParams.set('ratio', `2`);
		}

		dispatch('change', {
			url: url.href
		});
	}, 300);

	const handleActiveTabChanged = (tab: 'center' | 'bbox' | 'auto') => {
		activeTab = tab;
		updateApiUrl();

		if (activeTab === 'auto') {
			map.scrollZoom.disable();
			map.boxZoom.disable();
			map.dragRotate.disable();
			map.dragPan.disable();
			map.keyboard.disable();
			map.doubleClickZoom.disable();
			map.touchZoomRotate.disable();
			map.touchPitch.disable();
		} else if (activeTab === 'bbox') {
			map.scrollZoom.enable();
			map.boxZoom.enable();
			map.dragRotate.disable();
			map.dragPan.enable();
			map.keyboard.enable();
			map.doubleClickZoom.enable();
			map.touchZoomRotate.disable();
			map.touchPitch.disable();

			pitch = 0;
			bearing = 0;
			map.setBearing(bearing);
			map.setPitch(pitch);
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
				<input class="input is-small" type="number" placeholder="Type width" bind:value={width} />
			</div>
		</div>
		<div class="field m-1">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Height</label>
			<div class="control">
				<input class="input is-small" type="number" placeholder="Type height" bind:value={height} />
			</div>
		</div>
	</div>

	<div class="tabs is-toggle is-toggle-rounded is-fullwidth mt-1 mb-2">
		<ul>
			<li class={activeTab === 'center' ? 'is-active' : ''}>
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
			<li class={activeTab === 'bbox' ? 'is-active' : ''}>
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
			<li class={activeTab === 'auto' ? 'is-active' : ''}>
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
		<div class="p-1" hidden={activeTab !== 'center'}>
			<div class="is-flex">
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">longitude</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={longitude} readonly />
					</div>
				</div>
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">latitude</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={latitude} readonly />
					</div>
				</div>
			</div>

			<div class="is-flex">
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">zoom level</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={zoom} readonly />
					</div>
				</div>

				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">bearing</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={bearing} readonly />
					</div>
				</div>

				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">pitch</label>
					<div class="control">
						<input class="input is-small" type="number" bind:value={pitch} readonly />
					</div>
				</div>
			</div>
		</div>

		<div class="p-1" hidden={activeTab !== 'bbox'}>
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
		</div>

		<div class="p-1" hidden={activeTab !== 'auto'}>
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
				<input type="checkbox" bind:checked={isRetina} />
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
						class="button {extension === ext ? 'is-link' : ''}"
						on:click={() => (extension = ext)}>{ext}</button
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
