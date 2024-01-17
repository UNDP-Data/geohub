<script lang="ts">
	import { page } from '$app/stores';
	import LegendColorMapRow from '$components/maplibre/LegendColorMapRow.svelte';
	import MaplibreColorPicker from '$components/maplibre/MaplibreColorPicker.svelte';
	import PropertySelect from '$components/maplibre/symbol/PropertySelect.svelte';
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import NumberInput from '$components/util/NumberInput.svelte';
	import {
		ClassificationMethodTypes,
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		NumberOfRandomSamplingPoints,
		UniqueValueThreshold
	} from '$lib/config/AppConfig';
	import {
		checkVectorLayerHighlySkewed,
		convertFunctionToExpression,
		getIntervalList,
		getSampleFromInterval,
		getVectorDefaultColor,
		updateIntervalValues
	} from '$lib/helper';
	import type { ColorMapRow, VectorTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		DEFAULTCOLOR_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		type ClassificationMethodStore,
		type ColorMapNameStore,
		type DefaultColorStore,
		type MapStore,
		type NumberOfClassesStore
	} from '$stores';
	import chroma from 'chroma-js';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';
	import ClassificationMethodSelect from '../ClassificationMethodSelect.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let propertyName:
		| 'fill-extrusion-color'
		| 'fill-color'
		| 'line-color'
		| 'icon-color'
		| 'circle-color'
		| 'text-color';
	export let transparentColor = [255, 255, 255, 0];
	export let onlyNumberFields = false;
	export let classesContextKey = NUMBER_OF_CLASSES_CONTEXT_KEY;
	export let colorContextKey = DEFAULTCOLOR_CONTEXT_KEY;
	export let colormapContextKey = COLORMAP_NAME_CONTEXT_KEY;
	export let classificationContextKey = CLASSIFICATION_METHOD_CONTEXT_KEY;

	const classificationMethodStore: ClassificationMethodStore = getContext(classificationContextKey);
	$: $classificationMethodStore, handleClassificationMethodChanged();

	const colorMapNameStore: ColorMapNameStore = getContext(colormapContextKey);
	const numberOfClassesStore: NumberOfClassesStore = getContext(classesContextKey);
	const defaultColorStore: DefaultColorStore = getContext(colorContextKey);
	$defaultColorStore = getVectorDefaultColor($map, layerId, propertyName);

	const maplibreLayerId = $map.getLayer(layerId).sourceLayer;
	let statLayer = metadata.json.tilestats?.layers?.find((l) => l.layer === maplibreLayerId);

	let containerWidth: number;

	let isUniqueValue = false;

	const getColor = (): string | string[] => {
		let color = $map.getPaintProperty(layerId, propertyName);
		if (!color) {
			color = $defaultColorStore;
		}
		color = convertFunctionToExpression(color, chroma(transparentColor).hex());
		return color as string | string[];
	};

	const resetClassificationMethods = () => {
		if (!$classificationMethodStore) {
			const highlySkewed = checkVectorLayerHighlySkewed(
				metadata,
				maplibreLayerId,
				propertySelectValue
			);
			if (highlySkewed) {
				$classificationMethodStore = ClassificationMethodTypes.LOGARITHMIC;
			}
		}
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
				const attrValue = isLast ? undefined : values[i];
				const color = isLast ? chroma(values[i]).rgba() : chroma(values[i + 1]).rgba();
				const row: ColorMapRow = {
					index: rows.length,
					color: color,
					start: attrValue,
					end: attrValue
				};
				rows.push(row);
			}
		} else if (value[0] === 'step') {
			// interval
			const attribute = statLayer.attributes?.find((a) => a.attribute === propertySelectValue);
			for (let i = 2; i < values.length; i = i + 2) {
				const color = chroma(values[i]).rgba();
				const attrValue = values[i + 1];

				const row: ColorMapRow = {
					index: rows.length,
					color: color,
					start: rows.length === 0 ? attribute.min.toFixed(1) : rows[rows.length - 1].end,
					end: attrValue ?? attribute.max.toFixed(2)
				};
				rows.push(row);
			}
			$numberOfClassesStore = rows.length;
		} else {
			$numberOfClassesStore = $page.data.config.NumberOfClasses;
		}

		return rows;
	};

	let colorMapRows: ColorMapRow[] = [];
	let randomSample: { [key: string]: number[] } = {};

	$: isConstantColor = propertySelectValue?.length === 0 ?? false;

	onMount(() => {
		resetClassificationMethods();
		colorMapRows = Array.isArray(value) ? restoreColorMapRows() : [];
		updateMapFromRows();
	});

	const handleSetColor = (e: CustomEvent) => {
		value = e.detail.color;
		map.setPaintProperty(layerId, propertyName, value);
		$defaultColorStore = e.detail.color;
	};

	const handlePropertyChange = debounce(() => {
		resetClassificationMethods();
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

			// trim and remove empty value from the list
			let cleanedValues = values.filter((v) => (v as string).trim() !== '');
			let classes = cleanedValues.length + 1; // create colors including default value
			let scaleColorList = chroma
				.scale($colorMapNameStore.replace('_r', ''))
				.mode('lrgb')
				.colors(classes);
			if (isReverse) {
				scaleColorList = scaleColorList.reverse();
			}
			for (let i = 0; i < classes; i++) {
				const color = chroma(scaleColorList[i]).rgb();
				const isLast = i === classes - 1;
				const value = isLast ? undefined : cleanedValues[i];
				const row: ColorMapRow = {
					index: i,
					color: [...color, 1],
					start: value,
					end: value
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
	};

	const updateMapFromRows = () => {
		if (propertySelectValue.length === 0) {
			let color = Array.isArray(value) ? $defaultColorStore : value;
			if (!color) {
				color = chroma.random().hex();
			}
			map.setPaintProperty(layerId, propertyName, color);
			value = color;
			return;
		}

		if (isUniqueValue) {
			const colorSteps = ['match', ['get', propertySelectValue]];
			for (let i = 0; i < colorMapRows.length; i++) {
				const row = colorMapRows[i];
				if (row.end) {
					const value = row.end as string;
					colorSteps.push(value.trim());
				}
				const color = chroma([row.color[0], row.color[1], row.color[2], row.color[3]]).hex();
				colorSteps.push(color);
			}
			map.setPaintProperty(layerId, propertyName, colorSteps);
		} else {
			const colorSteps: unknown[] = ['step', ['get', propertySelectValue]];
			for (let i = 0; i < colorMapRows.length; i++) {
				const row = colorMapRows[i];
				const color = chroma([row.color[0], row.color[1], row.color[2], row.color[3]]).hex();
				colorSteps.push(color);
				if (i === colorMapRows.length - 1) continue;
				colorSteps.push(row.end);
			}
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
		{onlyNumberFields}
		showEmptyFields={true}
		emptyFieldLabel="Use constant value for color"
	/>

	<div class="pt-2">
		{#if isConstantColor && typeof value === 'string'}
			<div>
				<MaplibreColorPicker bind:rgba={value} on:change={handleSetColor} width="100%" />
			</div>
		{:else if propertySelectValue?.length > 0}
			<div class="is-flex pb-1">
				<div style="width: {containerWidth}px;">
					<ColorMapPicker
						bind:colorMapName={$colorMapNameStore}
						on:colorMapChanged={handleColormapNameChanged}
						isFullWidth={true}
					/>
				</div>
			</div>

			{#if !isUniqueValue}
				<div class="columns">
					<div class="column is-7 pr-1">
						<FieldControl title="Method">
							<div slot="help">
								Whether to apply a classification method for a vector layer in selected property.
								This setting is only used when you select a property to classify the layer
								appearance.
							</div>
							<div slot="control">
								<ClassificationMethodSelect contextKey={classificationContextKey} />
							</div>
						</FieldControl>
					</div>
					<div class="column pl-1">
						<FieldControl title="Classes">
							<div slot="help">Increate or decrease the number of classes</div>
							<div slot="control">
								<NumberInput
									bind:value={$numberOfClassesStore}
									minValue={NumberOfClassesMinimum}
									maxValue={NumberOfClassesMaximum}
									on:change={handleIncrementDecrementClasses}
									size="normal"
								/>
							</div>
						</FieldControl>
					</div>
				</div>
			{/if}

			<table
				class="color-table table {isUniqueValue
					? 'is-striped'
					: ''} is-narrow is-hoverable is-fullwidth"
			>
				<thead>
					<tr class="is-size-6">
						<th style="min-width: 120px;">Appearance</th>
						{#if !isUniqueValue}
							<th style="min-width: 100px;">Start</th>
						{/if}
						<th style="width: 100%;">
							{#if !isUniqueValue}
								End
							{:else}
								Value
							{/if}
						</th>
					</tr>
				</thead>
				<tbody>
					{#each colorMapRows as colorMapRow}
						<LegendColorMapRow
							bind:colorMapRow
							bind:colorMapName={$colorMapNameStore}
							bind:hasUniqueValues={isUniqueValue}
							on:changeIntervalValues={handleChangeIntervalValues}
							on:changeColorMap={handleRowColorChanged}
						/>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style lang="scss">
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
