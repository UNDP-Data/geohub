<script lang="ts">
	import LegendColorMapRow from '$components/maplibre/LegendColorMapRow.svelte';
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import NumberInput from '$components/util/NumberInput.svelte';
	import { NumberOfClassesMaximum, NumberOfClassesMinimum } from '$lib/config/AppConfig';
	import {
		generateColorMap,
		getActiveBandIndex,
		getLayerSourceUrl,
		getLayerStyle,
		getValueFromRasterTileUrl,
		isUniqueValueRaster,
		remapInputValue,
		updateIntervalValues,
		updateParamsInURL
	} from '$lib/helper';
	import type { BandMetadata, ColorMapRow, RasterTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		type ClassificationMethodStore,
		type ColorMapNameStore,
		type MapStore,
		type NumberOfClassesStore,
		type RasterRescaleStore
	} from '$stores';
	import chroma from 'chroma-js';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';
	import ClassificationSwitch from './ClassificationSwitch.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);
	const numberOfClassesStore: NumberOfClassesStore = getContext(NUMBER_OF_CLASSES_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);
	const classificationMethodStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY
	);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let manualClassificationEnabled: boolean;

	const bandIndex = getActiveBandIndex(metadata);
	const bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;

	const layerHasUniqueValues = isUniqueValueRaster(metadata);

	let colorMapRows: Array<ColorMapRow> = [];
	let layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);
	let layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);

	if (!$rescaleStore) {
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
		if (Array.isArray(colormap)) {
			// interval legend
			const first = colormap[0];
			const last = colormap[colormap.length - 1];
			$rescaleStore = [first[0][0], last[0][1]];
		} else {
			// unique value legend or default legend
			$rescaleStore = [layerMin, layerMax];
		}
	}

	// let layerMean = Number(bandMetaStats['STATISTICS_MEAN'])
	let percentile98 = metadata.stats[Object.keys(metadata.stats)[bandIndex]]['percentile_98'];
	let legendLabels = {};

	// NOTE: As we are now using a default classification method, there is no need to determine the classification method,
	// based on the layer mean and max values. Commenting out the code for now, but will be removed in the future.

	// if (!layerHasUniqueValues) {
	//   const layerMeanToMax = layerMean / layerMax
	//   if (layerMeanToMax >= -0.5 && layerMeanToMax <= 0.5) classificationMethod = ClassificationMethodTypes.LOGARITHMIC
	//   if ((layerMeanToMax > -5 && layerMeanToMax < -0.5) || (layerMeanToMax > 0.5 && layerMeanToMax < 5))
	//     classificationMethod = ClassificationMethodTypes.NATURAL_BREAK
	//   if (layerMeanToMax <= -5 && layerMeanToMax >= 5) classificationMethod = ClassificationMethodTypes.EQUIDISTANT
	// } else {
	//   legendLabels = bandMetaStats['STATISTICS_UNIQUE_VALUES']
	//   numberOfClasses = Object.keys(legendLabels).length
	// }

	if (layerHasUniqueValues) {
		legendLabels = bandMetaStats['STATISTICS_UNIQUE_VALUES'];
		$numberOfClassesStore = Object.keys(legendLabels).length;
	}

	let containerWidth: number;
	let numberOfClassesWidth: number;
	let dropdownButtonWidth: number;
	let colormapPickerWidth: number;
	$: colormapPickerWidth = layerHasUniqueValues
		? containerWidth
		: containerWidth - numberOfClassesWidth - dropdownButtonWidth;

	const setInitialColorMapRows = (isClassificationMethodEdited = false) => {
		if (layerHasUniqueValues) {
			let colorsList = chroma
				.scale($colorMapNameStore)
				.mode('lrgb')
				.colors(Object.keys(legendLabels).length);
			colorMapRows = Object.keys(legendLabels).map((key, index) => {
				return {
					index: index,
					start: Number(key),
					end: legendLabels[key],
					color: chroma(colorsList[index]).rgba()
				};
			});
		} else {
			// Fixme: Possible bug in titiler. The Max value is not the real max in some layers
			// 0.01 is added to the max value as in some layers, the max value is not the real max value.
			const min = $rescaleStore[0];
			const max = $rescaleStore[1] + 0.01;

			colorMapRows = generateColorMap(
				min,
				max,
				colorMapRows,
				$numberOfClassesStore,
				$classificationMethodStore,
				isClassificationMethodEdited,
				percentile98,
				$colorMapNameStore
			);
		}
	};

	const classifyImage = () => {
		let encodedColorMapRows;
		if (layerHasUniqueValues) {
			let urlColorMap = {};
			colorMapRows.forEach((row) => {
				urlColorMap[row.start] = [
					row.color[0],
					row.color[1],
					row.color[2],
					remapInputValue(row.color[3], 0, 1, 0, 255)
				];
			});
			encodedColorMapRows = JSON.stringify(urlColorMap);
		} else {
			let urlColorMap = [];
			colorMapRows.forEach((row) => {
				urlColorMap.push([
					[row.start, row.end],
					[row.color[0], row.color[1], row.color[2], remapInputValue(row.color[3], 0, 1, 0, 255)]
				]);
			});
			encodedColorMapRows = JSON.stringify(urlColorMap);
		}
		handleParamsUpdate(encodedColorMapRows);
	};

	const setColorMapRowsFromURL = () => {
		if (layerHasUniqueValues) {
			const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap');
			if (colormap) {
				colorMapRows = Object.keys(colormap).map((key, index) => {
					return {
						index: index,
						start: key,
						end: legendLabels[key],
						color: [
							colormap[key][0],
							colormap[key][1],
							colormap[key][2],
							remapInputValue(colormap[key][3], 0, 255, 0, 1)
						]
					};
				});
			}
		} else {
			const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
			if (colormap) {
				colorMapRows = colormap.map((item, index) => {
					return {
						index: index,
						start: item[0][0],
						end: item[0][1],
						color: [item[1][0], item[1][1], item[1][2], remapInputValue(item[1][3], 0, 255, 0, 1)]
					};
				});
			}
		}
		$numberOfClassesStore = colorMapRows.length;
	};

	const handleColorMapChanged = (e) => {
		if (e.detail) {
			let colorMapName = e.detail.colorMapName;
			if (!colorMapName) return;

			let colorsList = chroma
				.scale(colorMapName.replace('_r', ''))
				.mode('lrgb')
				.colors($numberOfClassesStore);
			const isReverse = colorMapName.indexOf('_r') !== -1;
			if (isReverse) {
				colorsList = colorsList.reverse();
			}
			colorMapRows = colorMapRows.map((row, index) => {
				return {
					index: index,
					start: row.start,
					end: row.end,
					color: chroma(colorsList[index]).rgba()
				};
			});
		}

		classifyImage();
	};

	const handleIncrementDecrementClasses = (e: CustomEvent) => {
		$numberOfClassesStore = e.detail.value;
		colorMapRows = [];
		setInitialColorMapRows();
		classifyImage();
	};

	const handleChangeIntervalValues = (event: CustomEvent) => {
		colorMapRows = updateIntervalValues(event, colorMapRows);
		classifyImage();
	};

	const handleClassificationMethodChange = () => {
		setInitialColorMapRows(true);
		classifyImage();
	};

	$: $rescaleStore, handleRescaleChanged();
	const handleRescaleChanged = debounce(() => {
		if (!$rescaleStore) return;
		colorMapRows = [];
		setInitialColorMapRows();
		classifyImage();
	}, 200);

	const handleParamsUpdate = (encodeColorMapRows) => {
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		layerURL.searchParams.delete('colormap_name');
		layerURL.searchParams.delete('rescale');
		const updatedParams = Object.assign({ colormap: encodeColorMapRows });
		const layerStyle = getLayerStyle($map, layerId);
		updateParamsInURL(layerStyle, layerURL, updatedParams, map);
	};

	onMount(() => {
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap');
		if (!colormap) {
			setInitialColorMapRows();
			classifyImage();
		} else {
			setColorMapRowsFromURL();
		}
		classificationMethodStore.subscribe(() => {
			handleClassificationMethodChange();
		});
	});

	const handleClassificationChanged = (e) => {
		let enabled = e.detail.enabled;
		if (!enabled) {
			// go back to default legend

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
		}
	};
</script>

<div
	class="intervals-view-container"
	data-testid="intervals-view-container"
	bind:clientWidth={containerWidth}
>
	<div class="is-flex">
		<div class="field has-addons">
			<p class="control" style="width: {colormapPickerWidth}px">
				<ColorMapPicker
					bind:colorMapName={$colorMapNameStore}
					on:colorMapChanged={handleColorMapChanged}
					isFullWidth={true}
				/>
			</p>
			{#if !layerHasUniqueValues}
				<p class="control">
					<ClassificationSwitch
						bind:width={dropdownButtonWidth}
						bind:enabled={manualClassificationEnabled}
						on:change={handleClassificationChanged}
					/>
				</p>
			{/if}
		</div>
		{#if !layerHasUniqueValues}
			<div class="pl-2" bind:clientWidth={numberOfClassesWidth}>
				<NumberInput
					bind:value={$numberOfClassesStore}
					minValue={NumberOfClassesMinimum}
					maxValue={NumberOfClassesMaximum}
					on:change={handleIncrementDecrementClasses}
					size="normal"
				/>
			</div>
		{/if}
	</div>

	<div class="colormap-rows-container pt-2">
		{#each colorMapRows as colorMapRow}
			<LegendColorMapRow
				bind:colorMapRow
				bind:colorMapName={$colorMapNameStore}
				hasUniqueValues={layerHasUniqueValues}
				on:changeColorMap={handleColorMapChanged}
				on:changeIntervalValues={handleChangeIntervalValues}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
	:global(.select:not(.is-multiple):not(.is-loading)::after) {
		border-color: #ff0000;
	}

	.colormap-rows-container {
		overflow-y: auto;
		max-height: 200px;
	}
</style>
