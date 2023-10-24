<script lang="ts">
	import RasterBrightnessMax from '$components/maplibre/raster/RasterBrightnessMax.svelte';
	import RasterContrast from '$components/maplibre/raster/RasterContrast.svelte';
	import RasterHueRotate from '$components/maplibre/raster/RasterHueRotate.svelte';
	import RasterResampling from '$components/maplibre/raster/RasterResampling.svelte';
	import RasterSaturation from '$components/maplibre/raster/RasterSaturation.svelte';
	import OptionalPropertyEditor from '../OptionalPropertyEditor.svelte';

	export let layerId: string;
</script>

<OptionalPropertyEditor {layerId}>
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
