<script lang="ts">
	import { page } from '$app/stores';
	import RasterColorMap from '$components/maplibre/raster/RasterColorMap.svelte';
	import LegendColorMapRow from '$components/pages/map/layers/LegendColorMapRow.svelte';
	import NumberInput from '$components/util/NumberInput.svelte';
	import {
		ClassificationMethodTypes,
		ClassificationMethods,
		NumberOfClassesMaximum,
		NumberOfClassesMinimum
	} from '$lib/config/AppConfig';
	import {
		generateColorMap,
		getActiveBandIndex,
		getLayerSourceUrl,
		getLayerStyle,
		getMaxValueOfCharsInIntervals,
		getValueFromRasterTileUrl,
		remapInputValue,
		updateIntervalValues,
		updateParamsInURL
	} from '$lib/helper';
	import type { BandMetadata, ColorMapRow, Layer, RasterTileMetadata } from '$lib/types';
	import {
		MAPSTORE_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		layerList,
		type MapStore,
		type RasterRescaleStore
	} from '$stores';
	import chroma from 'chroma-js';
	import { cloneDeep, debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);

	export let layer: Layer;
	export let layerHasUniqueValues: boolean;
	export let numberOfClasses: number;

	let info: RasterTileMetadata;
	({ info } = layer);
	const bandIndex = getActiveBandIndex(info);
	const bandMetaStats = info['band_metadata'][bandIndex][1] as BandMetadata;

	let colorClassCountMax = NumberOfClassesMaximum;
	let colorClassCountMin = NumberOfClassesMinimum;
	let colorMapName = layer.colorMapName;
	let colorMapRows: Array<ColorMapRow> = [];
	let layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);
	let layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);

	if (!$rescaleStore) {
		const colormap = getValueFromRasterTileUrl($map, layer.id, 'colormap') as number[][][];
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
	let rowWidth: number;
	let percentile98 = info.stats[Object.keys(info.stats)[bandIndex]]['percentile_98'];
	let legendLabels = {};

	const getClassificationMethod = () => {
		if (layer.classificationMethod) return layer.classificationMethod;
		return $page.data.config.ClassificationMethod;
	};

	let classificationMethod: ClassificationMethodTypes = getClassificationMethod();

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
		numberOfClasses = Object.keys(legendLabels).length;
	}

	let containerWidth: number;

	const setInitialColorMapRows = (e?: CustomEvent) => {
		if (layerHasUniqueValues) {
			let colorsList = chroma
				.scale(colorMapName)
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
			let isClassificationMethodEdited = false;
			if (e) {
				classificationMethod = (e.target as HTMLSelectElement).value as ClassificationMethodTypes;
				isClassificationMethodEdited = true;
			}

			// Fixme: Possible bug in titiler. The Max value is not the real max in some layers
			// 0.01 is added to the max value as in some layers, the max value is not the real max value.
			const min = $rescaleStore[0];
			const max = $rescaleStore[1] + 0.01;

			colorMapRows = generateColorMap(
				min,
				max,
				colorMapRows,
				numberOfClasses,
				classificationMethod,
				isClassificationMethodEdited,
				percentile98,
				colorMapName
			);
			rowWidth = getMaxValueOfCharsInIntervals(colorMapRows);
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
		layerList.setClassificationMethod(layer.id, classificationMethod);
		layerList.setColorMapName(layer.id, colorMapName);
	};

	const setColorMapRowsFromURL = () => {
		if (layerHasUniqueValues) {
			const colormap = getValueFromRasterTileUrl($map, layer.id, 'colormap');
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
			const colormap = getValueFromRasterTileUrl($map, layer.id, 'colormap') as number[][][];
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
		numberOfClasses = colorMapRows.length;
	};

	const handleColorMapChanged = (e) => {
		if (e.detail) {
			let colorMapName = e.detail.colorMapName;
			if (!colorMapName && layer.colorMapName) {
				colorMapName = layer.colorMapName;
			}
			if (!colorMapName) return;

			const colorsList = chroma.scale(colorMapName).mode('lrgb').colors(numberOfClasses);
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

		layerList.setColorMapName(layer.id, colorMapName);
	};

	const handleIncrementDecrementClasses = (e: CustomEvent) => {
		numberOfClasses = e.detail.value;
		layer = cloneDeep(layer);
		colorMapRows = [];
		setInitialColorMapRows();
		classifyImage();
	};

	const handleChangeIntervalValues = (event: CustomEvent) => {
		colorMapRows = updateIntervalValues(event, colorMapRows);
		rowWidth = getMaxValueOfCharsInIntervals(colorMapRows);
		classifyImage();
	};

	const handleClassificationMethodChange = (e) => {
		setInitialColorMapRows(e);
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
		const layerUrl = getLayerSourceUrl($map, layer.id) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		layerURL.searchParams.delete('colormap_name');
		layerURL.searchParams.delete('rescale');
		const updatedParams = Object.assign({ colormap: encodeColorMapRows });
		const layerStyle = getLayerStyle($map, layer.id);
		updateParamsInURL(layerStyle, layerURL, updatedParams, map);
	};

	onMount(async () => {
		const colormap = getValueFromRasterTileUrl($map, layer.id, 'colormap');
		if (!colormap) {
			setInitialColorMapRows();
			classifyImage();
		} else {
			setColorMapRowsFromURL();
		}
		return colorMapRows;
	});
</script>

<div
	class="intervals-view-container"
	data-testid="intervals-view-container"
	bind:clientWidth={containerWidth}
>
	<div class="legend-controls mb-4">
		<div class="classification field pr-2" hidden={layerHasUniqueValues}>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label has-text-centered">Classification</label>
			<div class="control">
				<select
					bind:value={classificationMethod}
					on:change={handleClassificationMethodChange}
					style="width: 114px;"
					title="Classification Methods"
				>
					{#each ClassificationMethods as classificationMethod}
						<option class="legend-text" value={classificationMethod.code}
							>{classificationMethod.name}</option
						>
					{/each}
				</select>
			</div>
		</div>

		<div class="number-classes field pr-2" hidden={layerHasUniqueValues}>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label has-text-centered">Number of Classes</label>
			<div class="control">
				<NumberInput
					bind:value={numberOfClasses}
					bind:minValue={colorClassCountMin}
					bind:maxValue={colorClassCountMax}
					on:change={handleIncrementDecrementClasses}
				/>
			</div>
		</div>
		<RasterColorMap
			bind:colorMapName
			contentWidth={layerHasUniqueValues ? containerWidth - 15 : 40}
			on:change={handleColorMapChanged}
		/>
	</div>

	<div class="colormap-rows-container">
		{#each colorMapRows as colorMapRow}
			<LegendColorMapRow
				bind:colorMapRow
				bind:colorMapName
				bind:hasUniqueValues={layerHasUniqueValues}
				bind:rowWidth
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

	.legend-controls {
		display: flex;
		justify-content: flex-start;
		align-items: center;

		.number-classes {
			margin: 0 auto;
		}
	}

	.colormap-rows-container {
		overflow-y: auto;
		max-height: 200px;
	}
</style>
