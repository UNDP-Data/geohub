<script lang="ts">
	import OptionalPropertyEditor from '$components/maplibre/OptionalPropertyEditor.svelte';
	import RasterBrightnessMax from '$components/maplibre/raster/RasterBrightnessMax.svelte';
	import RasterContrast from '$components/maplibre/raster/RasterContrast.svelte';
	import RasterHueRotate from '$components/maplibre/raster/RasterHueRotate.svelte';
	import RasterResampling from '$components/maplibre/raster/RasterResampling.svelte';
	import RasterRescale from '$components/maplibre/raster/RasterRescale.svelte';
	import RasterSaturation from '$components/maplibre/raster/RasterSaturation.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import { isRgbRaster, isUniqueValueRaster } from '$lib/helper';
	import type { RasterTileMetadata, Tag } from '$lib/types';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import OpacitySlider from '../OpacitySlider.svelte';
	import RasterBandSelector from './RasterBandSelector.svelte';
	import RasterBrightnessMin from './RasterBrightnessMin.svelte';

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];

	const isRgbTile = isRgbRaster(metadata.colorinterp);
	const layerHasUniqueValues = isRgbTile ? false : isUniqueValueRaster(metadata);

	let expanded: { [key: string]: boolean } = {
		Data: true
	};
	// to allow only an accordion to be expanded
	let expandedDatasetId: string;
	$: {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	}
</script>

<OptionalPropertyEditor>
	<Accordion headerTitle="Data related" fontSize="medium" bind:isExpanded={expanded['Data']}>
		<div slot="content">
			<p class="py-2">
				You can adjust data related parameters. These parameters operate on the data itself.
			</p>

			{#if !isRgbTile}
				<FieldControl title="Raster band">
					<div slot="help">Select a raster band to be rendered.</div>
					<div slot="control"><RasterBandSelector bind:layerId bind:metadata /></div>
				</FieldControl>
			{/if}

			{#if !layerHasUniqueValues && !isRgbTile}
				<FieldControl title="Rescale min/max values">
					<div slot="help">Rescale minimum/maximum values to filter</div>
					<div slot="control"><RasterRescale bind:layerId bind:metadata bind:tags /></div>
				</FieldControl>
			{/if}

			<FieldControl title="Resampling">
				<div slot="help">
					The resampling/interpolation method to use for overscaling, also known as texture
					magnification filter
					<br />
					<b>Bi-linear</b>: (Bi)linear filtering interpolates pixel values using the weighted
					average of the four closest original source pixels creating a smooth but blurry look when
					overscaled
					<br />
					<b>Nearest neighbor</b>: Nearest neighbor filtering interpolates pixel values using the
					nearest original source pixel creating a sharp but pixelated look when overscaled
				</div>
				<div slot="control"><RasterResampling bind:layerId /></div>
			</FieldControl>
		</div>
	</Accordion>

	<Accordion headerTitle="Appearance" fontSize="medium" bind:isExpanded={expanded['Appearance']}>
		<div slot="content">
			<p class="py-2">
				You can adjust data visulasization parameters. These parameters do not alter underlying the
				data source.
			</p>

			<FieldControl title="Opacity">
				<div slot="help">The opacity at which the image will be drawn.</div>
				<div slot="control"><OpacitySlider bind:layerId /></div>
			</FieldControl>

			<FieldControl title="Brightness max">
				<div slot="help">
					Increase or reduce the brightness of the image. The value is the maximum brightness.
				</div>
				<div slot="control"><RasterBrightnessMax bind:layerId /></div>
			</FieldControl>

			<FieldControl title="Brightness min">
				<div slot="help">
					Increase or reduce the brightness of the image. The value is the minimum brightness.
				</div>
				<div slot="control"><RasterBrightnessMin bind:layerId /></div>
			</FieldControl>

			<FieldControl title="Contrast">
				<div slot="help">Increase or reduce the contrast of the image.</div>
				<div slot="control"><RasterContrast bind:layerId /></div>
			</FieldControl>

			<FieldControl title="Hue rotate">
				<div slot="help">Rotates hues around the color wheel.</div>
				<div slot="control"><RasterHueRotate bind:layerId /></div>
			</FieldControl>

			<FieldControl title="Saturation">
				<div slot="help">Increase or reduce the saturation of the image.</div>
				<div slot="control"><RasterSaturation bind:layerId /></div>
			</FieldControl>
		</div>
	</Accordion>
</OptionalPropertyEditor>
