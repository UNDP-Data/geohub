<script lang="ts">
	import type { StoryMapChapter } from '$lib/types';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { Map } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let chapter: StoryMapChapter;
	export let isActive = false;

	let mapContainer: HTMLDivElement;

	const tippyTooltip = initTooltipTippy();

	let map: Map;

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: chapter.style,
			center: chapter.location.center,
			zoom: chapter.location.zoom,
			pitch: chapter.location.pitch,
			bearing: chapter.location.bearing,
			interactive: false,
			attributionControl: false
		});
		map.once('styledata', () => {
			return;
		});
	});

	const handleSettingClicked = () => {
		console.log('clicked settings');
	};

	const handleDuplicateClicked = () => {
		dispatch('duplicate', { chapter });
	};

	const handleDeleteClicked = () => {
		dispatch('delete', { chapter });
	};
</script>

<div class="preview {isActive ? 'is-active' : ''}" bind:this={mapContainer}>
	{#if isActive}
		<div class="is-flex ope-buttons">
			<button
				class="ope-button mr-1 is-flex is-align-items-center is-justify-content-center"
				on:click={handleSettingClicked}
				use:tippyTooltip={{ content: 'Change the setting of this slide' }}
			>
				<span class="material-symbols-outlined small-icon"> settings </span>
			</button>
			<button
				class="ope-button mr-1 is-flex is-align-items-center is-justify-content-center"
				on:click={handleDuplicateClicked}
				use:tippyTooltip={{ content: 'Duplicate this slide' }}
			>
				<span class="material-symbols-outlined small-icon"> content_copy </span>
			</button>
			<button
				class="ope-button is-flex is-align-items-center is-justify-content-center"
				on:click={handleDeleteClicked}
				use:tippyTooltip={{ content: 'Delete this slide' }}
			>
				<span class="material-symbols-outlined small-icon"> delete </span>
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.preview {
		position: relative;
		width: 100%;
		height: 100px;

		&.is-active {
			border: 2px solid #4f95dd;
		}

		.ope-buttons {
			position: absolute;
			bottom: 4px;
			left: 8px;

			.ope-button {
				width: 24px;
				height: 24px;
				border-radius: 50%;
				background-color: white;
				border: none;
				color: #55606e;

				.small-icon {
					font-size: 16px !important;
				}

				&:hover {
					background-color: #f7f7f7;
					color: gray;
				}
			}
		}
	}
</style>
