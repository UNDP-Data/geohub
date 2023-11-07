<script lang="ts">
	import { page } from '$app/stores';
	import MaplibreColorPicker from '$components/maplibre/MaplibreColorPicker.svelte';
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import NumberInput from '$components/util/NumberInput.svelte';
	import {
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		NumberOfRandomSamplingPoints,
		UniqueValueThreshold
	} from '$lib/config/AppConfig';
	import {
		getIntervalList,
		getMaxValueOfCharsInIntervals,
		getSampleFromInterval,
		updateIntervalValues
	} from '$lib/helper';
	import type { ColorMapRow, VectorTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		type ClassificationMethodStore,
		type ColorMapNameStore,
		type MapStore,
		type NumberOfClassesStore
	} from '$stores';
	import chroma from 'chroma-js';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';
	import LegendColorMapRow from '../LegendColorMapRow.svelte';
	import PropertySelect from '../symbol/PropertySelect.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);
	const classificationMethodStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY
	);
	$: $classificationMethodStore, handleClassificationMethodChanged();

	const numberOfClassesStore: NumberOfClassesStore = getContext(NUMBER_OF_CLASSES_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string = undefined;
	export let propertyName: 'fill-extrusion-color' | 'fill-color' | 'line-color' | 'icon-color';
	export let transparentColor = [255, 255, 255, 0];

	const maplibreLayerId = $map.getLayer(layerId).sourceLayer;
	let statLayer = metadata.json.tilestats?.layers?.find((l) => l.layer === maplibreLayerId);

	let containerWidth: number;
	let numberOfClassesWidth: number;
	$: colormapPickerWidth = isUniqueValue ? containerWidth : containerWidth - numberOfClassesWidth;

	let isUniqueValue = false;

	const getColor = (): string | string[] => {
		let color = $map.getPaintProperty(layerId, propertyName);
		if (!color) {
			color = defaultColor;
		}
		return color as string | string[];
	};

	let value = getColor();
	let propertySelectValue = Array.isArray(value) ? value[1][1] : '';

	const restoreColorMapRows = () => {
		let rows = [];
		const values = value as string[];
		if (values[0] === 'match') {
			// unique value
			isUniqueValue = true;
			for (let i = 2; i < values.length; i = i + 2) {
				const isLast = i === values.length - 1;
				if (isLast) continue;
				const attrValue = values[i];
				const color = chroma(values[i + 1]).rgba();
				const row: ColorMapRow = {
					index: rows.length,
					color: color,
					start: attrValue,
					end: attrValue
				};
				rows.push(row);
			}
		} else {
			// interval
			const attribute = statLayer.attributes?.find((a) => a.attribute === propertySelectValue);
			for (let i = 2; i < values.length - 1; i = i + 2) {
				const color = chroma(values[i]).rgba();
				const attrValue = values[i + 1];

				const row: ColorMapRow = {
					index: rows.length,
					color: color,
					start: rows.length === 0 ? attribute.min : rows[rows.length - 1].end,
					end: attrValue
				};
				rows.push(row);
			}
		}
		return rows;
	};

	let colorMapRows: ColorMapRow[] = Array.isArray(value) ? restoreColorMapRows() : [];
	$numberOfClassesStore =
		colorMapRows.length === 0 ? $page.data.config.NumberOfClasses : colorMapRows.length;
	let randomSample: { [key: string]: number[] } = {};
	let rowWidth: number;

	$: isConstantColor = propertySelectValue?.length === 0 ?? false;

	onMount(() => {
		value = getColor();
		map.setPaintProperty(layerId, propertyName, value);
	});

	const handleSetColor = (e: CustomEvent) => {
		value = e.detail.color;
		map.setPaintProperty(layerId, propertyName, value);
		defaultColor = e.detail.color;
	};

	const handlePropertyChange = debounce(() => {
		$numberOfClassesStore = $page.data.config.NumberOfClasses;
		updateColorMapRows();
		updateMapFromRows();
	}, 300);

	const handleColormapNameChanged = debounce(() => {
		updateColorMapRows();
		updateMapFromRows();
	}, 300);

	const handleRowColorChanged = debounce(() => {
		// updateColorMapRows();
		updateMapFromRows();
	}, 300);

	const handleChangeIntervalValues = debounce((event) => {
		colorMapRows = updateIntervalValues(event, colorMapRows);
		updateMapFromRows();
	}, 300);

	const handleClassificationMethodChanged = () => {
		if (!$map) return;
		if (propertySelectValue.length === 0) return;
		updateColorMapRows();
		updateMapFromRows();
	};

	const handleIncrementDecrementClasses = () => {
		if (!$map) return;
		if (propertySelectValue.length === 0) return;
		updateColorMapRows();
		updateMapFromRows();
	};

	const updateColorMapRows = () => {
		if (!$map) return;
		if (propertySelectValue.length === 0) {
			colorMapRows = [];
			return;
		}
		const attribute = statLayer.attributes?.find((a) => a.attribute === propertySelectValue);

		const values = attribute.values;
		isUniqueValue =
			(values && values.length === 1) ||
			(attribute.type !== 'number' &&
				values &&
				values.length > 0 &&
				values.length <= UniqueValueThreshold) ||
			(attribute.type === 'number' && values && values.length <= UniqueValueThreshold) ||
			attribute.type !== 'number';

		colorMapRows = [];
		if (isUniqueValue) {
			const isReverse = $colorMapNameStore.indexOf('_r') !== -1;
			let scaleColorList = chroma
				.scale($colorMapNameStore.replace('_r', ''))
				.mode('lrgb')
				.colors(values.length);
			if (isReverse) {
				scaleColorList = scaleColorList.reverse();
			}
			for (let i = 0; i < attribute.values.length; i++) {
				const color = chroma(scaleColorList[i]).rgb();
				const row: ColorMapRow = {
					index: i,
					color: [...color, 1],
					start: attribute.values[i],
					end: attribute.values[i]
				};
				colorMapRows.push(row);
			}
		} else {
			if (!randomSample[attribute.attribute]) {
				randomSample[attribute.attribute] = getSampleFromInterval(
					attribute.min,
					attribute.max,
					NumberOfRandomSamplingPoints
				);
			}
			const sample = randomSample[attribute.attribute];
			const intervalList = getIntervalList(
				$classificationMethodStore,
				attribute.min,
				attribute.max,
				sample,
				$numberOfClassesStore
			);
			const isReverse = $colorMapNameStore.indexOf('_r') !== -1;
			const scales = chroma.scale($colorMapNameStore.replace('_r', ''));
			let scaleColorList = scales.colors(intervalList.length, 'rgb');
			if (isReverse) {
				scaleColorList = scaleColorList.reverse();
			}

			// create interval list (start / end)
			for (let i = 0; i < intervalList.length - 1; i++) {
				const row: ColorMapRow = {
					index: i,
					color: [...scaleColorList[i], 1],
					start: intervalList[i],
					end: intervalList[i + 1]
				};
				colorMapRows.push(row);
			}
		}
		rowWidth = getMaxValueOfCharsInIntervals(colorMapRows);
	};

	const updateMapFromRows = () => {
		if (propertySelectValue.length === 0) {
			const color = Array.isArray(value) ? defaultColor : value;
			defaultColor = color;
			map.setPaintProperty(layerId, propertyName, color);
			return;
		}

		if (isUniqueValue) {
			const colorSteps = ['match', ['get', propertySelectValue]];
			for (let i = 0; i < colorMapRows.length; i++) {
				const row = colorMapRows[i];
				colorSteps.push(row.end as string);
				const color = chroma([row.color[0], row.color[1], row.color[2], row.color[3]]).hex();
				colorSteps.push(color);
			}
			colorSteps.push(chroma(transparentColor).hex());
			map.setPaintProperty(layerId, propertyName, colorSteps);
		} else {
			const colorSteps = ['step', ['get', propertySelectValue]];
			for (let i = 0; i < colorMapRows.length; i++) {
				const row = colorMapRows[i];
				const color = chroma([row.color[0], row.color[1], row.color[2], row.color[3]]).hex();
				colorSteps.push(color);
				colorSteps.push(row.end);
			}
			colorSteps.push(chroma(transparentColor).hex());
			map.setPaintProperty(layerId, propertyName, colorSteps);
		}
	};
</script>

<div class="py-2" bind:clientWidth={containerWidth}>
	<PropertySelect
		bind:propertySelectValue
		on:select={handlePropertyChange}
		{layerId}
		{metadata}
		onlyNumberFields={false}
		showEmptyFields={true}
		emptyFieldLabel="Use constant value for color"
	/>

	<div class="pt-2">
		{#if isConstantColor && typeof value === 'string'}
			<MaplibreColorPicker bind:rgba={value} on:change={handleSetColor} width="100%" />
		{:else if propertySelectValue?.length > 0}
			<div class="is-flex">
				{#if !isUniqueValue}
					<div class="py-1 pr-2" bind:clientWidth={numberOfClassesWidth}>
						<NumberInput
							bind:value={$numberOfClassesStore}
							minValue={NumberOfClassesMinimum}
							maxValue={NumberOfClassesMaximum}
							on:change={handleIncrementDecrementClasses}
							size="normal"
						/>
					</div>
				{/if}

				<div style="width: {colormapPickerWidth}px;">
					<ColorMapPicker
						bind:colorMapName={$colorMapNameStore}
						on:colorMapChanged={handleColormapNameChanged}
						isFullWidth={true}
					/>
				</div>
			</div>

			<div class="colorMapRows">
				{#each colorMapRows as colorMapRow}
					<LegendColorMapRow
						bind:colorMapRow
						bind:colorMapName={$colorMapNameStore}
						bind:rowWidth
						bind:hasUniqueValues={isUniqueValue}
						on:changeIntervalValues={handleChangeIntervalValues}
						on:changeColorMap={handleRowColorChanged}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.colorMapRows {
		overflow-y: auto;
		max-height: 200px;
	}
</style>
