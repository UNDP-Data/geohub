<script lang="ts">
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import ClassificationSwitch from '$components/maplibre/raster/ClassificationSwitch.svelte';
	import RasterBrightnessMax from '$components/maplibre/raster/RasterBrightnessMax.svelte';
	import RasterBrightnessMin from '$components/maplibre/raster/RasterBrightnessMin.svelte';
	import RasterClassifyLegend from '$components/maplibre/raster/RasterClassifyLegend.svelte';
	import RasterContrast from '$components/maplibre/raster/RasterContrast.svelte';
	import RasterHueRotate from '$components/maplibre/raster/RasterHueRotate.svelte';
	import RasterResampling from '$components/maplibre/raster/RasterResampling.svelte';
	import RasterRescale from '$components/maplibre/raster/RasterRescale.svelte';
	import RasterSaturation from '$components/maplibre/raster/RasterSaturation.svelte';
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
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
	import { Accordion, Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { getContext } from 'svelte';
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
	let dropdownButtonWidth: number;
	$: colormapPickerWidth = containerWidth - dropdownButtonWidth - 20;

	let manualClassificationEnabled = false;

	const unit = tags?.find((t) => t.key === 'unit')?.value;

	const handleClassificationChanged = async () => {
		if (layerHasUniqueValues) return;
		handleColorMapChanged();
	};

	const handleColorMapChanged = () => {
		if (layerHasUniqueValues) return;
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

	// $: $rescaleStore, handleRescaleChanged();
	const handleRescaleChanged = debounce(() => {
		if (layerHasUniqueValues) return;
		if (!$rescaleStore) return;
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

	rescaleStore?.subscribe(handleRescaleChanged);

	const decideLegendType = () => {
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
		// maintains the state of the legendType
		if (colormap || layerHasUniqueValues) {
			manualClassificationEnabled = true;
		} else {
			manualClassificationEnabled = false;
		}
	};

	/**
	 * This component will only decide which legend to show based on the legendType
	 * Initially, the legendType is decided based on if the layer is unique or not
	 * if the layer is unique, the legendType is set to CLASSIFY
	 * if the layer is not unique, the legendType is set to DEFAULT
	 */
	const initializeLegend = async () => {
		decideLegendType();
		await loadMap($map);
	};

	let expanded: { [key: string]: boolean } = {
		colormap: true
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

<div class="legend-container pt-2" bind:clientWidth={containerWidth}>
	{#await initializeLegend()}
		<div class="is-flex is-justify-content-center">
			<Loader size="small" />
		</div>
	{:then}
		{#if $legendReadonly}
			<RasterSimpleLegend {layerId} {metadata} {tags} />
		{:else}
			{#if !isRgbTile}
				<Accordion headerTitle="Colormap" bind:isExpanded={expanded['colormap']}>
					<div class="pt-2 pb-4" slot="content">
						{#if !manualClassificationEnabled}
							<div class="field has-addons">
								<p class="control" style="width: {colormapPickerWidth}px">
									<ColorMapPicker
										bind:colorMapName={$colorMapNameStore}
										on:colorMapChanged={handleColorMapChanged}
										isFullWidth={true}
									/>
									{#if $rescaleStore?.length > 1}
										<div class="is-flex">
											<span class="has-text-weight-bold is-size-6"
												>{$rescaleStore[0].toFixed(2)}</span
											>
											{#if unit}
												<span class="unit align-center has-text-weight-bold is-size-5">{unit}</span>
											{/if}
											<span class="align-right has-text-weight-bold is-size-6"
												>{$rescaleStore[1].toFixed(2)}</span
											>
										</div>
									{/if}
								</p>
								<p class="control">
									<ClassificationSwitch
										bind:width={dropdownButtonWidth}
										bind:enabled={manualClassificationEnabled}
										on:change={handleClassificationChanged}
									/>
								</p>
							</div>
						{:else}
							<RasterClassifyLegend bind:layerId bind:metadata bind:manualClassificationEnabled />
						{/if}
					</div>
					<div slot="button">
						<Help>Apply a colormap to classify legend</Help>
					</div>
				</Accordion>
			{/if}

			{#if !layerHasUniqueValues && !isRgbTile}
				<Accordion headerTitle="Rescale min/max values" bind:isExpanded={expanded['rescale']}>
					<div class="pb-2" slot="content">
						<RasterRescale bind:layerId bind:metadata bind:tags />
					</div>
					<div slot="button">
						<Help>Rescale minimum/maximum values to filter</Help>
					</div>
				</Accordion>
			{/if}

			<Accordion headerTitle="Resampling" bind:isExpanded={expanded['resampling']}>
				<div class="pb-2" slot="content">
					<RasterResampling bind:layerId />
				</div>
				<div slot="button">
					<Help>
						The resampling/interpolation method to use for overscaling, also known as texture
						magnification filter
						<br />
						<b>Bi-linear</b>: (Bi)linear filtering interpolates pixel values using the weighted
						average of the four closest original source pixels creating a smooth but blurry look
						when overscaled
						<br />
						<b>Nearest neighbor</b>: Nearest neighbor filtering interpolates pixel values using the
						nearest original source pixel creating a sharp but pixelated look when overscaled
					</Help>
				</div>
			</Accordion>

			<Accordion headerTitle="Opacity" bind:isExpanded={expanded['opacity']}>
				<div class="pb-2" slot="content">
					<OpacitySlider bind:layerId />
				</div>
				<div slot="button">
					<Help>The opacity at which the image will be drawn.</Help>
				</div>
			</Accordion>

			<Accordion headerTitle="Brightness max" bind:isExpanded={expanded['brightness-max']}>
				<div class="pb-2" slot="content">
					<RasterBrightnessMax bind:layerId />
				</div>
				<div slot="button">
					<Help>
						Increase or reduce the brightness of the image. The value is the maximum brightness.
					</Help>
				</div>
			</Accordion>

			<Accordion headerTitle="Brightness min" bind:isExpanded={expanded['brightness-min']}>
				<div class="pb-2" slot="content">
					<RasterBrightnessMin bind:layerId />
				</div>
				<div slot="button">
					<Help>
						Increase or reduce the brightness of the image. The value is the minimum brightness.
					</Help>
				</div>
			</Accordion>

			<Accordion headerTitle="Contrast" bind:isExpanded={expanded['contrast']}>
				<div class="pb-2" slot="content">
					<RasterContrast bind:layerId />
				</div>
				<div slot="button">
					<Help>Increase or reduce the contrast of the image.</Help>
				</div>
			</Accordion>

			<Accordion headerTitle="Hue rotate" bind:isExpanded={expanded['hue-rotate']}>
				<div class="pb-2" slot="content">
					<RasterHueRotate bind:layerId />
				</div>
				<div slot="button">
					<Help>Rotates hues around the color wheel.</Help>
				</div>
			</Accordion>

			<Accordion headerTitle="Saturation" bind:isExpanded={expanded['saturation']}>
				<div class="pb-2" slot="content">
					<RasterSaturation bind:layerId />
				</div>
				<div slot="button">
					<Help>Increase or reduce the saturation of the image.</Help>
				</div>
			</Accordion>
		{/if}
	{/await}
</div>

<style lang="scss">
	.legend-container {
		position: relative;
		min-height: 40px;
	}

	.align-center {
		margin-left: auto;
		margin-right: 0;
	}
	.align-right {
		margin-left: auto;
	}

	.unit {
		max-width: 100px;
	}
</style>
