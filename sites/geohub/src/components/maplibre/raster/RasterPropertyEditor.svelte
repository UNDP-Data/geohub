<script lang="ts">
	import RasterBrightnessMax from '$components/maplibre/raster/RasterBrightnessMax.svelte';
	import RasterContrast from '$components/maplibre/raster/RasterContrast.svelte';
	import RasterHueRotate from '$components/maplibre/raster/RasterHueRotate.svelte';
	import RasterResampling from '$components/maplibre/raster/RasterResampling.svelte';
	import RasterRescale from '$components/maplibre/raster/RasterRescale.svelte';
	import RasterSaturation from '$components/maplibre/raster/RasterSaturation.svelte';
	import { isRgbRaster, isUniqueValueRaster } from '$lib/helper';
	import type { RasterTileMetadata, Tag } from '$lib/types';
	import OptionalPropertyEditor from '../OptionalPropertyEditor.svelte';

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];

	const isRgbTile = isRgbRaster(metadata.colorinterp);
	const layerHasUniqueValues = isRgbTile ? false : isUniqueValueRaster(metadata);
</script>

<OptionalPropertyEditor {layerId}>
	{#if !layerHasUniqueValues && !isRgbTile}
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label is-normal"> Rescale min/max values </label>
			<div class="control">
				<RasterRescale bind:layerId bind:metadata bind:tags />
			</div>
		</div>
	{/if}

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
</OptionalPropertyEditor>
