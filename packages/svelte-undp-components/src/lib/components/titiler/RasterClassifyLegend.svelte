<script lang="ts" module>
	/**
	 * Check if the raster is unique value dataset or not
	 * @param metadata raster tile metadata
	 */
	export const isUniqueValueRaster = (metadata: RasterTileMetadata) => {
		const bandIndex = getActiveBandIndex(metadata);
		const bandMetaStats =
			metadata && metadata['band_metadata'] && bandIndex > -1
				? (metadata['band_metadata'][bandIndex][1] as BandMetadata)
				: undefined;
		const layerHasUniqueValues =
			bandMetaStats &&
			bandMetaStats['STATISTICS_UNIQUE_VALUES'] &&
			Object.keys(bandMetaStats['STATISTICS_UNIQUE_VALUES']).length > 0;
		return layerHasUniqueValues;
	};
</script>

<script lang="ts">
	import type { ColorMapRow } from '$lib/components/maplibre/util/LegendColorMapRow.svelte';
	import LegendColorMapRow from '$lib/components/maplibre/util/LegendColorMapRow.svelte';
	import ColorMapPicker from '$lib/components/ui/ColorMapPicker.svelte';
	import FieldControl from '$lib/components/ui/FieldControl.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import {
		ClassificationMethods,
		ClassificationMethodTypes
	} from '$lib/constants/ClassificationMethod';
	import type {
		BandMetadata,
		RasterLayerStats,
		RasterTileMetadata
	} from '$lib/interfaces/RasterTileMetadata';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { getActiveBandIndex } from '$lib/util/getActiveBandIndex';
	import { getIntervalList } from '$lib/util/getIntervalList';
	import { getLayerSourceUrl } from '$lib/util/getLayerSourceUrl';
	import { getSampleFromHistogram } from '$lib/util/getSampleFromHistogram';
	import { getSampleFromInterval } from '$lib/util/getSampleFromInterval';
	import { getValueFromRasterTileUrl } from '$lib/util/getValueFromRasterTileUrl';
	import { remapInputValue } from '$lib/util/remapInputValue';
	import { updateIntervalValues } from '$lib/util/updateIntervalValues';
	import { updateParamsInURL } from '$lib/util/updateParamsInUrl';
	import chroma from 'chroma-js';
	import { debounce } from 'lodash-es';
	import type { RasterLayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		metadata: RasterTileMetadata;
		rescale?: number[] | undefined;
		numberOfClasses?: number;
		colorMapName?: string;
		classificationMethod?: ClassificationMethodTypes;
		numberOfRandomSamplingPoints?: number;
		numberOfClassesMaximum?: number;
		numberOfClassesMinimum?: number;
	}

	let {
		layerId = $bindable(),
		metadata = $bindable(),
		rescale = $bindable(undefined),
		numberOfClasses = $bindable(5),
		colorMapName = $bindable('viridis'),
		classificationMethod = $bindable(ClassificationMethodTypes.NATURAL_BREAK),
		numberOfRandomSamplingPoints = $bindable(1000),
		numberOfClassesMaximum = $bindable(25),
		numberOfClassesMinimum = $bindable(2)
	}: Props = $props();

	const layerHasUniqueValues = isUniqueValueRaster(metadata) ?? false;

	let colorMapRows: Array<ColorMapRow> = $state([]);
	let layerMax: number;
	let layerMin: number;
	let histogram: { bins: number[]; count: number[] };

	if ('stats' in metadata) {
		const band = metadata.active_band_no;
		if (band) {
			const rasterLayerStats = metadata.stats as RasterLayerStats;
			const bandStats = rasterLayerStats[band];
			layerMin = Number(bandStats.min);
			layerMax = Number(bandStats.max);
			if (bandStats.histogram && bandStats.histogram.length === 2) {
				histogram = {
					bins: bandStats.histogram[1],
					count: bandStats.histogram[0]
				};
			}
		}
	} else {
		const bandIndex = getActiveBandIndex(metadata);
		const bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;
		layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);
		layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);
	}

	if (!rescale) {
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap') as number[][][];
		if (Array.isArray(colormap)) {
			// interval legend
			const first = colormap[0];
			const last = colormap[colormap.length - 1];
			rescale = [first[0][0], last[0][1]];
		} else {
			// unique value legend or default legend
			rescale = [layerMin, layerMax];
		}
	}

	let percentile98 = !layerHasUniqueValues
		? metadata.stats[metadata.active_band_no]['percentile_98']
		: 0;
	let legendLabels: { [key: string]: string } = {};

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
		const bandIndex = getActiveBandIndex(metadata);
		const bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;
		legendLabels = bandMetaStats['STATISTICS_UNIQUE_VALUES'] as { [key: string]: string };
		if (typeof legendLabels === 'string') {
			legendLabels = JSON.parse(legendLabels);
		}
		numberOfClasses = Object.keys(legendLabels).length;
	}

	let containerWidth: number = $state();
	let numberOfClassesWidth: number;
	let colormapPickerWidth: number = $derived(
		layerHasUniqueValues ? containerWidth : containerWidth - numberOfClassesWidth
	);

	const setInitialColorMapRows = (isClassificationMethodEdited = false) => {
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
			// Fixme: Possible bug in titiler. The Max value is not the real max in some layers
			// 0.01 is added to the max value as in some layers, the max value is not the real max value.
			const min = rescale[0];
			const max = rescale[1] + 0.01;

			colorMapRows = generateColorMap(
				min,
				max,
				colorMapRows,
				numberOfClasses,
				classificationMethod,
				isClassificationMethodEdited,
				percentile98,
				colorMapName,
				histogram
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
		numberOfClasses = colorMapRows.length;
	};

	const handleColorMapChanged = (colorMapName: string) => {
		if (colorMapName) {
			let name = colorMapName;
			if (!name) return;

			let colorsList = chroma.scale(name.replace('_r', '')).mode('lrgb').colors(numberOfClasses);
			const isReverse = name.indexOf('_r') !== -1;
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

	const handleIncrementDecrementClasses = (value: number) => {
		numberOfClasses = value;
		colorMapRows = [];
		setInitialColorMapRows();
		classifyImage();
	};

	const handleChangeIntervalValues = (args: {
		index: number;
		id: number | string;
		value: number;
	}) => {
		colorMapRows = updateIntervalValues(args, colorMapRows);
		classifyImage();
	};

	const handleClassificationMethodChange = () => {
		setInitialColorMapRows(true);
		classifyImage();
	};

	const handleParamsUpdate = (encodeColorMapRows: string) => {
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);
		layerURL.searchParams.delete('colormap_name');
		layerURL.searchParams.delete('rescale');
		const updatedParams = Object.assign({ colormap: encodeColorMapRows });

		const style = $map.getStyle();
		const layer = style?.layers?.find((l) => l.id === layerId);
		if (layer) {
			updateParamsInURL(layer as RasterLayerSpecification, layerURL, updatedParams, $map);
		}
	};

	const generateColorMap = (
		min: number,
		max: number,
		colorMapRows: ColorMapRow[],
		numberOfClasses: number,
		classificationMethod: ClassificationMethodTypes,
		isClassificationMethodEdited: boolean,
		percentile98: number,
		colorMapName: string,
		histogram?: { bins: number[]; count: number[] }
	) => {
		const colorMap = [];
		const isReverse = colorMapName.indexOf('_r') !== -1;
		const scales = chroma.scale(colorMapName.replace('_r', ''));
		if (classificationMethod === ClassificationMethodTypes.LOGARITHMIC) {
			let randomSample: number[] = [];
			if (histogram) {
				randomSample = getSampleFromHistogram(
					histogram,
					numberOfRandomSamplingPoints,
					min,
					percentile98
				);
			}
			if (randomSample.length === 0) {
				randomSample = getSampleFromInterval(min, percentile98, numberOfRandomSamplingPoints);
			}
			const intervalList = getIntervalList(
				classificationMethod,
				min,
				percentile98,
				randomSample,
				numberOfClasses
			);
			let scaleColorList = scales.colors(intervalList.length, 'rgb');
			if (isReverse) {
				scaleColorList = scaleColorList.reverse();
			}
			for (let i = 0; i <= numberOfClasses - 2; i++) {
				const row: ColorMapRow = {
					index: i,
					color: [...scaleColorList[i], 1],
					start:
						isClassificationMethodEdited == false &&
						colorMapRows.length > 0 &&
						colorMapRows[i]?.start
							? colorMapRows[i].start
							: intervalList[i],
					end:
						isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.end
							? colorMapRows[i].end
							: intervalList[i + 1]
				};
				colorMap.push(row);
			}
			const lastRow: ColorMapRow = {
				index: numberOfClasses - 1,
				color: [...scaleColorList[numberOfClasses - 1], 1],
				start: Math.floor(percentile98),
				end: Math.ceil(max)
			};
			colorMap.push(lastRow);
			const replaceIndex = colorMap[colorMap.length - 2];

			replaceIndex['end'] = Math.floor(percentile98);
			colorMap.splice(colorMap.length - 2, replaceIndex);
		} else {
			let randomSample: number[] = [];
			if (histogram) {
				randomSample = getSampleFromHistogram(histogram, numberOfRandomSamplingPoints, min, max);
			}
			if (randomSample.length === 0) {
				randomSample = getSampleFromInterval(min, max, numberOfRandomSamplingPoints);
			}

			const intervalList = getIntervalList(
				classificationMethod,
				min,
				max,
				randomSample,
				numberOfClasses
			);
			let scaleColorList = scales.colors(intervalList.length, 'rgb');
			if (isReverse) {
				scaleColorList = scaleColorList.reverse();
			}
			for (let i = 0; i <= numberOfClasses - 1; i++) {
				const row: ColorMapRow = {
					index: i,
					color: [...scaleColorList[i], 1],
					start:
						isClassificationMethodEdited == false &&
						colorMapRows.length > 0 &&
						colorMapRows[i]?.start
							? colorMapRows[i].start
							: intervalList[i],
					end:
						isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.end
							? colorMapRows[i].end
							: intervalList[i + 1]
				};
				colorMap.push(row);
			}
		}
		return colorMap;
	};

	export const redraw = debounce(() => {
		if (layerHasUniqueValues === true) return;
		let currentMin = colorMapRows[0].start;
		if (!currentMin) currentMin = layerMin;
		let currentMax = (colorMapRows[colorMapRows.length - 1].end as number) - 0.01;
		if (!currentMax) currentMax = layerMax;
		if (rescale[0] === currentMin && rescale[1] === currentMax) return;
		colorMapRows = [];
		setInitialColorMapRows();
		classifyImage();
	}, 200);

	onMount(() => {
		const colormap = getValueFromRasterTileUrl($map, layerId, 'colormap');
		if (!colormap) {
			setInitialColorMapRows();
			classifyImage();
		} else {
			setColorMapRowsFromURL();
		}
	});

	// $: rescale, handleRescaleChanged();
</script>

<div
	class="intervals-view-container"
	data-testid="intervals-view-container"
	bind:clientWidth={containerWidth}
>
	{#if !(layerHasUniqueValues === true && metadata.colormap !== undefined)}
		<div class="field">
			<p class="control" style="width: {colormapPickerWidth}px">
				<ColorMapPicker bind:colorMapName onchange={handleColorMapChanged} />
			</p>
		</div>
	{/if}

	{#if !layerHasUniqueValues}
		<div class="columns mb-0">
			<div class="column is-6 pr-1 py-0">
				<FieldControl title="Method">
					{#snippet help()}
						<div>
							Whether to apply a classification method for a vector layer in selected property. This
							setting is only used when you select a property to classify the layer appearance.
						</div>
					{/snippet}
					{#snippet control()}
						<div>
							<div class="select is-normal is-fullwidth">
								<select
									bind:value={classificationMethod}
									onchange={handleClassificationMethodChange}
								>
									{#each ClassificationMethods as classificationMethod (classificationMethod.code)}
										<option
											class="legend-text"
											title="Classification Method"
											value={classificationMethod.code}>{classificationMethod.name}</option
										>
									{/each}
								</select>
							</div>
						</div>
					{/snippet}
				</FieldControl>
			</div>
			<div class="column pl-1 py-0">
				<FieldControl title="Classes">
					{#snippet help()}
						<div>Increase of decrease the number of classes.</div>
					{/snippet}
					{#snippet control()}
						<div>
							<NumberInput
								bind:value={numberOfClasses}
								minValue={numberOfClassesMinimum}
								maxValue={numberOfClassesMaximum}
								onchange={handleIncrementDecrementClasses}
								size="normal"
							/>
						</div>
					{/snippet}
				</FieldControl>
			</div>
		</div>
	{/if}

	<table
		class="color-table table {layerHasUniqueValues
			? 'is-striped'
			: ''} is-narrow is-hoverable is-fullwidth"
	>
		<thead>
			<tr class="is-size-6">
				<th style="min-width: 120px;">Appearance</th>
				{#if !layerHasUniqueValues}
					<th style="min-width: 100px;">Start</th>
				{/if}
				<th style="width: 100%;">
					{#if !layerHasUniqueValues}
						End
					{:else}
						Value
					{/if}
				</th>
			</tr>
		</thead>
		<tbody>
			<!-- eslint-disable @typescript-eslint/no-unused-vars -->
			{#each colorMapRows as colorMapRow, index (colorMapRow.index)}
				<LegendColorMapRow
					bind:colorMapRow={colorMapRows[index]}
					bind:colorMapName
					hasUniqueValues={layerHasUniqueValues}
					onchangeColorMap={() => {
						handleColorMapChanged('');
					}}
					onchangeIntervalValues={handleChangeIntervalValues}
					readonly={false}
				/>
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	:global(.select:not(.is-multiple):not(.is-loading)::after) {
		border-color: #ff0000;
	}

	.color-table {
		thead,
		tbody {
			display: block;
		}
		tbody {
			overflow-x: hidden;
			overflow-y: auto;
			max-height: 200px;
		}
	}
</style>
