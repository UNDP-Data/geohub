<script lang="ts">
	import { handleEnterKey, initTippy } from '$lib/helper';
	import RasterBrightnessMax from '$components/maplibre/raster/RasterBrightnessMax.svelte';
	import RasterContrast from '$components/maplibre/raster/RasterContrast.svelte';
	import RasterHueRotate from '$components/maplibre/raster/RasterHueRotate.svelte';
	import RasterResampling from '$components/maplibre/raster/RasterResampling.svelte';
	import RasterSaturation from '$components/maplibre/raster/RasterSaturation.svelte';

	export let layerId: string;

	const tippy = initTippy({
		appendTo: document.body,
		placement: 'right',
		maxWidth: 350
	});
	let tooltipContent: HTMLElement;
</script>

<button class="editor-button button is-primary is-normal" use:tippy={{ content: tooltipContent }}>
	<span class="icon is-small">
		<i class="fa-solid fa-palette fa-lg" />
	</span>
</button>

<div bind:this={tooltipContent} class="tooltip p-2">
	<span class="close icon" role="button" tabindex="0" on:keydown={handleEnterKey}>
		<i class="fa-solid fa-circle-xmark fa-2x" style="color:#1c1c1c;" />
	</span>

	<p class="title is-4">Raster settings</p>

	<div class="controls-container">
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label is-normal"> Brightness max </label>
			<div class="control">
				<RasterBrightnessMax bind:layerId />
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label is-normal"> Brightness min </label>
			<div class="control">
				<RasterBrightnessMax bind:layerId />
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label is-normal"> Contrast </label>
			<div class="control">
				<RasterContrast bind:layerId />
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label is-normal"> Hue rotate </label>
			<div class="control">
				<RasterHueRotate bind:layerId />
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label is-normal"> Resampling </label>
			<div class="control">
				<RasterResampling bind:layerId />
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label is-normal"> Saturation </label>
			<div class="control">
				<RasterSaturation bind:layerId />
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.editor-button {
		cursor: pointer;
	}

	.tooltip {
		font-size: 13px;
		z-index: 10;
		width: 260px;

		.close {
			position: absolute;
			top: 0.5rem;
			right: 0.6rem !important;
			cursor: pointer;
			z-index: 5;
		}

		.controls-container {
			max-height: 80vh;
			overflow-y: auto;
		}
	}
</style>
