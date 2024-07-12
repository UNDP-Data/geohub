<script lang="ts">
	import type { StoryMapChapter } from '$lib/types';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { Map } from 'maplibre-gl';
	import { onMount } from 'svelte';

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
		console.log(map);
	});

	const handleSettingClicked = () => {
		console.log('clicked settings');
	};

	const handleDuplicateClicked = () => {
		console.log('clicked duplicate');
	};

	const handleDeleteClicked = () => {
		console.log('clicked delete');
	};
</script>

<div class="preview {isActive ? 'is-active' : ''}" bind:this={mapContainer}>
	{#if isActive}
		<div class="is-flex ope-buttons">
			<button
				class="ope-button mr-1 pt-1"
				on:click={handleSettingClicked}
				use:tippyTooltip={{ content: 'Change the setting of this chapter' }}
			>
				<span class="material-icons-outlined small-icon"> settings </span>
			</button>
			<button
				class="ope-button mr-1 pt-1"
				on:click={handleDuplicateClicked}
				use:tippyTooltip={{ content: 'Duplicate this chapter' }}
			>
				<span class="material-icons-outlined small-icon"> content_copy </span>
			</button>
			<button
				class="ope-button pt-1"
				on:click={handleDeleteClicked}
				use:tippyTooltip={{ content: 'Delete this chapter' }}
			>
				<span class="material-icons-outlined small-icon"> delete </span>
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
				// text-align: center;
				// margin: auto;

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
