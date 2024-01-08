<script lang="ts">
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import ClassificationSwitch, {
		LegendType
	} from '$components/maplibre/raster/ClassificationSwitch.svelte';
	import RasterBrightnessMax from '$components/maplibre/raster/RasterBrightnessMax.svelte';
	import RasterBrightnessMin from '$components/maplibre/raster/RasterBrightnessMin.svelte';
	import RasterClassifyLegend from '$components/maplibre/raster/RasterClassifyLegend.svelte';
	import RasterContrast from '$components/maplibre/raster/RasterContrast.svelte';
	import RasterHueRotate from '$components/maplibre/raster/RasterHueRotate.svelte';
	import RasterResampling from '$components/maplibre/raster/RasterResampling.svelte';
	import RasterRescale from '$components/maplibre/raster/RasterRescale.svelte';
	import RasterSaturation from '$components/maplibre/raster/RasterSaturation.svelte';
	import Accordion from '$components/util/Accordion.svelte';
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import Help from '$components/util/Help.svelte';
	import {
		getLayerSourceUrl,
		getLayerStyle,
		getValueFromRasterTileUrl,
		isRgbRaster,
		isUniqueValueRaster,
		loadMap,
		updateParamsInURL
	} from '$lib/helper';
	import type { RasterTileMetadata, Tag } from '$lib/types';
	import {
		COLORMAP_NAME_CONTEXT_KEY,
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		type ColorMapNameStore,
		type LegendReadonlyStore,
		type MapStore,
		type RasterRescaleStore
	} from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';
	import RasterSimpleLegend from './RasterSimpleLegend.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);
	const legendReadonly: LegendReadonlyStore = getContext(LEGEND_READONLY_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let tags: Tag[] = [];

	const isRgbTile = isRgbRaster(metadata.colorinterp);
	let layerHasUniqueValues = isRgbTile ? false : isUniqueValueRaster(metadata);

	let containerWidth: number;

	let legendType: LegendType = undefined;

	const unit = tags?.find((t) => t.key === 'unit')?.value;

	const handleClassificationChanged = async () => {
		handleColorMapChanged();
	};

	const handleColorMapChanged = () => {
		if (layerHasUniqueValues) return;
		if (legendType !== LegendType.LINEAR) return;
		// linear colormap

		const currCMAP = getValueFromRasterTileUrl($map, layerId, 'colormap_name') as string;

		// invalid cases
		if (!$colorMapNameStore || currCMAP == $colorMapNameStore) {
			return;
		}

		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) {
			return;
		}

		const layerURL = new URL(layerUrl);
		// remove colormap in case the layer was previously in
		if (layerURL.searchParams.has('colormap')) layerURL.searchParams.delete('colormap');

		// set color map and force map rerender
		layerURL.searchParams.delete('colormap_name');

		//for rescale the rangeSliderValue sis reactive and also intialized from three locations so this is used to poulate
		// the rescale at all times
		layerURL.searchParams.delete('rescale');

		let updatedParams = { rescale: $rescaleStore.join(','), colormap_name: $colorMapNameStore };

		const layerStyle = getLayerStyle($map, layerId);
		updateParamsInURL(layerStyle, layerURL, updatedParams, map);
	};

	const handleRescaleChanged = debounce(() => {
		if (layerHasUniqueValues) return;
		if (!$rescaleStore) return;
		if (legendType !== LegendType.LINEAR) return;
		const layerStyle = getLayerStyle($map, layerId);
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		layerURL.searchParams.delete('colormap');
		updateParamsInURL(
			layerStyle,
			layerURL,
			{ rescale: $rescaleStore.join(','), colormap_name: $colorMapNameStore },
			map
		);
	}, 200);

	const decideLegendType = () => {
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
		// maintains the state of the legendType
		if (colormap || layerHasUniqueValues) {
			legendType = LegendType.CATEGORISED;
		} else {
			legendType = LegendType.LINEAR;
		}
	};

	let expanded: { [key: string]: boolean } = {
		color: true
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

	onMount(() => {
		if ($legendReadonly) return;
		/**
		 * This component will only decide which legend to show based on the legendType
		 * Initially, the legendType is decided based on if the layer is unique or not
		 * if the layer is unique, the legendType is set to CLASSIFY
		 * if the layer is not unique, the legendType is set to DEFAULT
		 */
		decideLegendType();
		rescaleStore?.subscribe(handleRescaleChanged);
	});
</script>

<div class="legend-container" bind:clientWidth={containerWidth}>
	{#if $legendReadonly}
		{#await loadMap($map)}
			<div class="is-flex is-justify-content-center"><Loader size="small" /></div>
		{:then}
			<RasterSimpleLegend {layerId} {metadata} {tags} />
		{/await}
	{:else}
		{#if !isRgbTile}
			<Accordion title="Color" bind:isExpanded={expanded['color']}>
				<div slot="content">
					{#if !layerHasUniqueValues}
						<FieldControl title="Type">
							<div slot="help">
								Switch classification type either a simple linear colormap or categorized
								classification.
							</div>
							<div slot="control">
								<ClassificationSwitch bind:legendType on:change={handleClassificationChanged} />
							</div>
						</FieldControl>
					{/if}

					{#if legendType === LegendType.LINEAR}
						<div class="field">
							<div class="control">
								{#if unit}
									<span class="unit is-size-6">{unit}</span>
								{/if}
								<div class="is-flex">
									<div style="width: {containerWidth}px">
										<ColorMapPicker
											bind:colorMapName={$colorMapNameStore}
											on:colorMapChanged={handleColorMapChanged}
											isFullWidth={true}
										/>
									</div>
								</div>
								{#if $rescaleStore?.length > 1}
									<div class="is-flex">
										<span class="is-size-6">{$rescaleStore[0].toFixed(2)}</span>
										<span class="align-right is-size-6">{$rescaleStore[1].toFixed(2)}</span>
									</div>
								{/if}
							</div>
						</div>
					{:else if legendType === LegendType.CATEGORISED}
						<RasterClassifyLegend bind:layerId bind:metadata />
					{/if}
				</div>
				<div slot="buttons">
					<Help>Apply a colormap to visualise the raster dataset</Help>
				</div>
			</Accordion>
		{/if}

		{#if !layerHasUniqueValues && !isRgbTile}
			<Accordion title="Rescale min/max values" bind:isExpanded={expanded['rescale']}>
				<div class="pb-2" slot="content">
					<RasterRescale bind:layerId bind:metadata bind:tags />
				</div>
				<div slot="buttons">
					<Help>Rescale minimum/maximum values to filter</Help>
				</div>
			</Accordion>
		{/if}

		<Accordion title="Resampling" bind:isExpanded={expanded['resampling']}>
			<div class="pb-2" slot="content">
				<RasterResampling bind:layerId />
			</div>
			<div slot="buttons">
				<Help>
					The resampling/interpolation method to use for overscaling, also known as texture
					magnification filter
					<br />
					<b>Bi-linear</b>: (Bi)linear filtering interpolates pixel values using the weighted
					average of the four closest original source pixels creating a smooth but blurry look when
					overscaled
					<br />
					<b>Nearest neighbor</b>: Nearest neighbor filtering interpolates pixel values using the
					nearest original source pixel creating a sharp but pixelated look when overscaled
				</Help>
			</div>
		</Accordion>

		<Accordion title="Opacity" bind:isExpanded={expanded['opacity']}>
			<div class="pb-2" slot="content">
				<OpacitySlider bind:layerId />
			</div>
			<div slot="buttons">
				<Help>The opacity at which the image will be drawn.</Help>
			</div>
		</Accordion>

		<Accordion title="Brightness max" bind:isExpanded={expanded['brightness-max']}>
			<div class="pb-2" slot="content">
				<RasterBrightnessMax bind:layerId />
			</div>
			<div slot="buttons">
				<Help>
					Increase or reduce the brightness of the image. The value is the maximum brightness.
				</Help>
			</div>
		</Accordion>

		<Accordion title="Brightness min" bind:isExpanded={expanded['brightness-min']}>
			<div class="pb-2" slot="content">
				<RasterBrightnessMin bind:layerId />
			</div>
			<div slot="buttons">
				<Help>
					Increase or reduce the brightness of the image. The value is the minimum brightness.
				</Help>
			</div>
		</Accordion>

		<Accordion title="Contrast" bind:isExpanded={expanded['contrast']}>
			<div class="pb-2" slot="content">
				<RasterContrast bind:layerId />
			</div>
			<div slot="buttons">
				<Help>Increase or reduce the contrast of the image.</Help>
			</div>
		</Accordion>

		<Accordion title="Hue rotate" bind:isExpanded={expanded['hue-rotate']}>
			<div class="pb-2" slot="content">
				<RasterHueRotate bind:layerId />
			</div>
			<div slot="buttons">
				<Help>Rotates hues around the color wheel.</Help>
			</div>
		</Accordion>

		<Accordion title="Saturation" bind:isExpanded={expanded['saturation']}>
			<div class="pb-2" slot="content">
				<RasterSaturation bind:layerId />
			</div>
			<div slot="buttons">
				<Help>Increase or reduce the saturation of the image.</Help>
			</div>
		</Accordion>
	{/if}
</div>

<style lang="scss">
	.legend-container {
		position: relative;
		min-height: 40px;
	}

	.align-right {
		margin-left: auto;
	}

	.unit {
		width: 100%;
	}
</style>
