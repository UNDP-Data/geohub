<script lang="ts">
	import type { StoryMapChapter } from '$lib/types';
	import { Map } from 'maplibre-gl';
	import { onMount } from 'svelte';

	export let chapter: StoryMapChapter;
	export let isActive = false;

	let mapContainer: HTMLDivElement;

	console.log(chapter);

	onMount(() => {
		const map: Map = new Map({
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
</script>

<div class="preview" bind:this={mapContainer}>
	{#if isActive}
		<div class="is-flex ope-buttons">
			<button class="button is-small ope-button">
				<span class="material-icons-outlined"> settings </span>
			</button>
			<button class="button is-small ope-button">
				<span class="material-icons-outlined"> content_copy </span>
			</button>
			<button class="button is-small ope-button">
				<span class="material-icons-outlined"> delete </span>
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';
	.preview {
		position: relative;
		width: 100%;
		height: 150px;
		border: 1px solid gray;

		.ope-buttons {
			position: absolute;
			bottom: 5px;
			left: 5px;

			.ope-button {
				&.button {
					border-radius: 90 !important;

					// background: white;
					// border: none;
					// outline: none;
					// box-shadow: none;
				}
			}
		}
	}
</style>
