<script lang="ts">
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import RasterBrightnessMax from '$components/maplibre/raster/RasterBrightnessMax.svelte';
	import RasterBrightnessMin from '$components/maplibre/raster/RasterBrightnessMin.svelte';
	import RasterContrast from '$components/maplibre/raster/RasterContrast.svelte';
	import RasterHueRotate from '$components/maplibre/raster/RasterHueRotate.svelte';
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
	import { getContext } from 'svelte';
	import ClassificationMethodSelect from '../ClassificationMethodSelect.svelte';
	import ClassificationSwitch from './ClassificationSwitch.svelte';
	import RasterClassifyLegend from './RasterClassifyLegend.svelte';
	import RasterResampling from './RasterResampling.svelte';
	import RasterRescale from './RasterRescale.svelte';

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
	$: colormapPickerWidth = containerWidth - dropdownButtonWidth;

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

	rescaleStore.subscribe(handleRescaleChanged);

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

		setTimeout(() => {
			expanded['colormap'] = true;
		}, 300);
	};

	let expanded: { [key: string]: boolean } = {};
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
		{#if isRgbTile}
			<p style="max-width: 300px;">
				This layer is true color dataset. You can adjust parameters to render from the button.
			</p>
		{:else if $legendReadonly}
			{#if !manualClassificationEnabled}
				<p style="width: 100%">
					<ColorMapPicker
						bind:colorMapName={$colorMapNameStore}
						on:colorMapChanged={handleColorMapChanged}
						isFullWidth={true}
					/>
					{#if $rescaleStore?.length > 1}
						<div class="is-flex">
							<span class="has-text-weight-bold is-size-6">{$rescaleStore[0].toFixed(2)}</span>
							{#if unit}
								<span class="unit align-center has-text-weight-bold is-size-5">{unit}</span>
							{/if}
							<span class="align-right has-text-weight-bold is-size-6"
								>{$rescaleStore[1].toFixed(2)}</span
							>
						</div>
					{/if}
				</p>
			{:else}
				<RasterClassifyLegend bind:layerId bind:metadata bind:manualClassificationEnabled />
			{/if}
		{:else}
			<Accordion size="small" bind:isExpanded={expanded['colormap']}>
				<div slot="header">
					<span class="has-text-weight-bold is-size-6"> Colormap </span>
				</div>
				<div slot="header-menu">
					<Help>Apply a colormap to classify legend</Help>
				</div>
				<div slot="content">
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
										<span class="has-text-weight-bold is-size-6">{$rescaleStore[0].toFixed(2)}</span
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
			</Accordion>

			{#if !layerHasUniqueValues && !isRgbTile}
				<Accordion size="small" bind:isExpanded={expanded['rescale']}>
					<div slot="header">
						<span class="has-text-weight-bold is-size-6"> Rescale min/max values </span>
					</div>
					<div slot="header-menu">
						<Help>Rescale minimum/maximum values to filter</Help>
					</div>
					<div slot="content">
						<RasterRescale bind:layerId bind:metadata bind:tags />
					</div>
				</Accordion>

				{#if manualClassificationEnabled}
					<Accordion size="small" bind:isExpanded={expanded['classification_method']}>
						<div slot="header">
							<span class="has-text-weight-bold is-size-6"> Classification method </span>
						</div>
						<div slot="header-menu">
							<Help>
								Whether to apply a classification method for a vector layer in selected property.
								This setting is only used when you select Classify tab to classify the layer
								appearance.
							</Help>
						</div>
						<div slot="content">
							<ClassificationMethodSelect />
						</div>
					</Accordion>
				{/if}
			{/if}

			<Accordion size="small" bind:isExpanded={expanded['resampling']}>
				<div slot="header">
					<span class="has-text-weight-bold is-size-6"> Resampling </span>
				</div>
				<div slot="header-menu">
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
				<div slot="content">
					<RasterResampling bind:layerId />
				</div>
			</Accordion>

			<Accordion size="small" bind:isExpanded={expanded['appearance']}>
				<div slot="header">
					<span class="has-text-weight-bold is-size-6">Appearance</span>
				</div>
				<div slot="header-menu">
					<Help>
						You can adjust data visulasization parameters. These parameters do not alter underlying
						the data source.
					</Help>
				</div>
				<div class="pb-2" slot="content">
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
		{/if}
	{/await}
</div>

<style lang="scss">
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
