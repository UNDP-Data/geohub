<script lang="ts">
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
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
		MAPSTORE_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		type ColorMapNameStore,
		type MapStore,
		type RasterRescaleStore
	} from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { getContext } from 'svelte';
	import ClassificationSwitch from './ClassificationSwitch.svelte';
	import RasterClassifyLegend from './RasterClassifyLegend.svelte';
	import RasterPropertyEditor from './RasterPropertyEditor.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);

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
	};
</script>

<div class="legend-container pt-2" bind:clientWidth={containerWidth}>
	{#await initializeLegend()}
		<div class="is-flex is-justify-content-center">
			<Loader size="small" />
		</div>
	{:then}
		<div class="editor-button">
			<RasterPropertyEditor bind:layerId bind:metadata bind:tags />
		</div>

		{#if !manualClassificationEnabled}
			{#if isRgbTile}
				<p style="max-width: 300px;">
					This layer is true color dataset. You can adjust parameters to render from the button.
				</p>
			{:else}
				<FieldControl title="Colormap">
					<div slot="help">Apply a colormap to classify legend</div>
					<div slot="control">
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
					</div>
				</FieldControl>
			{/if}
		{:else}
			<FieldControl title="Colormap">
				<div slot="help">Apply a colormap to classify legend</div>
				<div slot="control">
					<RasterClassifyLegend bind:layerId bind:metadata bind:manualClassificationEnabled />
				</div>
			</FieldControl>
		{/if}
	{/await}
</div>

<style lang="scss">
	.legend-container {
		position: relative;
		min-height: 40px;

		.editor-button {
			position: absolute;
			top: 0em;
			right: 0em;
			z-index: 10;
		}
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
