<script lang="ts">
	import { page } from '$app/stores';
	import PropertySelect from '$components/maplibre/symbol/PropertySelect.svelte';
	import {
		ClassificationMethodTypes,
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		NumberOfRandomSamplingPoints
	} from '$lib/config/AppConfig';
	import {
		checkVectorLayerHighlySkewed,
		convertFunctionToExpression,
		getIntervalList,
		getSampleFromInterval
	} from '$lib/helper';
	import type { ColorMapRow, VectorTileMetadata } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY_2,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		type ClassificationMethodStore,
		type MapStore,
		type NumberOfClassesStore
	} from '$stores';
	import { FieldControl, NumberInput } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';
	import ClassificationMethodSelect from '../ClassificationMethodSelect.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const numberOfClassesStore: NumberOfClassesStore = getContext(NUMBER_OF_CLASSES_CONTEXT_KEY_2);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	export let defaultValue: number;
	export let maxValue: number;
	export let minValue: number;
	export let propertyName: string;
	export let stepValue: number;
	export let legendCssTemplate: string; // should include {value} for the replacement
	export let styleType: 'layout' | 'paint' = 'paint';
	export let dataLabel = 'Value';
	export let classificationContextKey = CLASSIFICATION_METHOD_CONTEXT_KEY_2;

	const classificationMethodStore: ClassificationMethodStore = getContext(classificationContextKey);
	$: $classificationMethodStore, handleClassificationMethodChanged();

	const maplibreLayerId = $map.getLayer(layerId).sourceLayer;
	let statLayer = metadata.json.tilestats?.layers?.find((l) => l.layer === maplibreLayerId);

	$: isConstantValue = propertySelectValue?.length === 0;

	let colorMapRows: ColorMapRow[] = [];
	let randomSample: { [key: string]: number[] } = {};

	const getValue = () => {
		let value =
			styleType === 'paint'
				? $map.getPaintProperty(layerId, propertyName)
				: $map.getLayoutProperty(layerId, propertyName);
		if (!value) {
			value = defaultValue;
		}
		value = convertFunctionToExpression(value, defaultValue) as number;
		return value;
	};

	let value: unknown = getValue();
	let propertySelectValue = Array.isArray(value) ? value[1][1] : '';

	onMount(() => {
		resetClassificationMethods();
		colorMapRows = Array.isArray(value) ? restoreColorMapRows() : [];
	});

	const setValue = () => {
		if (styleType === 'paint') {
			map.setPaintProperty(layerId, propertyName, value);
		} else {
			map.setLayoutProperty(layerId, propertyName, value);
		}
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

	const restoreColorMapRows = () => {
		let rows = [];
		const values = value as unknown[];

		if (values[0] === 'match') {
			// unique value
			for (let i = 2; i < values.length; i = i + 2) {
				const isLast = i === values.length - 1;
				if (isLast) continue;
				const attrValue = values[i];
				const row: ColorMapRow = {
					index: rows.length,
					value: values[i + 1] as number,
					start: attrValue as number,
					end: attrValue as number
				};
				rows.push(row);
			}
		} else if (values[0] === 'step') {
			// interval
			const attribute = statLayer.attributes?.find((a) => a.attribute === propertySelectValue);
			for (let i = 2; i < values.length; i = i + 2) {
				const attrValue = values[i + 1];

				const row: ColorMapRow = {
					index: rows.length,
					value: values[i] as number,
					start: rows.length === 0 ? attribute.min : rows[rows.length - 1].end,
					end: (attrValue as number) ?? undefined
				};
				rows.push(row);
			}
			$numberOfClassesStore = rows.length;
		} else {
			$numberOfClassesStore = $page.data.config.NumberOfClasses;
		}
		return rows;
	};

	const updateColorMapRows = () => {
		if (!$map) return;
		if (propertySelectValue.length === 0) {
			colorMapRows = [];
			return;
		}
		const attribute = statLayer.attributes?.find((a) => a.attribute === propertySelectValue);

		colorMapRows = [];

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
			$numberOfClassesStore - 1 // the last row is for default value
		);

		// create interval list (start / end)
		let lastValue = 1;
		for (let i = 0; i < intervalList.length; i++) {
			const newValue = i === 0 ? lastValue : lastValue + 0.5;
			const row: ColorMapRow = {
				index: i,
				value: newValue,
				start: intervalList[i],
				end: intervalList[i + 1]
			};
			lastValue = newValue;
			colorMapRows.push(row);
		}
	};

	const updateMapFromRows = () => {
		if (propertySelectValue.length === 0) {
			let v = Array.isArray(value) ? defaultValue : value;
			if (styleType === 'paint') {
				map.setPaintProperty(layerId, propertyName, v);
			} else {
				map.setLayoutProperty(layerId, propertyName, v);
			}
			value = v as number;
			return;
		}

		const steps: unknown[] = ['step', ['get', propertySelectValue]];
		for (let i = 0; i < colorMapRows.length; i++) {
			const row = colorMapRows[i];
			steps.push(row.value);
			if (i === colorMapRows.length - 1) continue;
			steps.push(row.end);
		}

		if (styleType === 'paint') {
			map.setPaintProperty(layerId, propertyName, steps);
		} else {
			map.setLayoutProperty(layerId, propertyName, steps);
		}
	};

	const handlePropertyChange = debounce(() => {
		resetClassificationMethods();
		updateColorMapRows();
		updateMapFromRows();
	}, 300);

	const handleIncrementDecrementClasses = () => {
		if (!$map) return;
		if (propertySelectValue.length === 0) return;
		updateColorMapRows();
		updateMapFromRows();
	};

	const handleClassificationMethodChanged = () => {
		if (!$map) return;
		if (propertySelectValue.length === 0) return;
		updateColorMapRows();
		updateMapFromRows();
	};

	const handleRowValueChanged = debounce((value: number, index: number) => {
		if (!$map) return;
		if (propertySelectValue.length === 0) return;
		// updateColorMapRows();

		const row = colorMapRows[index];
		row.value = value;

		updateMapFromRows();
	}, 300);
</script>

<div class="is-flex">
	<div style="width: 100%;">
		<PropertySelect
			bind:propertySelectValue
			on:select={handlePropertyChange}
			{layerId}
			{metadata}
			onlyNumberFields={true}
			showEmptyFields={true}
			emptyFieldLabel="Use constant value for width"
			readonly={false}
		/>
	</div>
	{#if isConstantValue && typeof value === 'number'}
		<div class="is-flex">
			<NumberInput
				bind:value
				{minValue}
				{maxValue}
				bind:step={stepValue}
				on:change={setValue}
				readonly={false}
			/>
		</div>
	{/if}
</div>

<div class="pt-2">
	{#if propertySelectValue?.length > 0}
		<div class="columns">
			<div class="column is-6 pr-1">
				<FieldControl title="Method">
					<div slot="help">
						Whether to apply a classification method for a vector layer in selected property. This
						setting is only used when you select a property to classify the layer appearance.
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

		<!-- <div class="colormap-rows-container"> -->
		<table class="value-table table is-narrow is-hoverable is-fullwidth">
			<thead>
				<tr class="is-size-6">
					<th style="min-width: 100px;">Appearance</th>
					<th style="min-width: 100px;">{dataLabel}</th>
					<th style="min-width: 10px;"></th>
					<th style="width: 100%;">Breakpoint</th>
				</tr>
			</thead>
			<tbody>
				{#each colorMapRows as row, index}
					<tr data-testid="line-width-row-container">
						<td style="min-width: 100px;">
							<div style={legendCssTemplate.replace(/{value}/g, `${row.value}`)} />
						</td>
						<td style="min-width: 100px;">
							<NumberInput
								bind:value={row.value}
								{minValue}
								{maxValue}
								bind:step={stepValue}
								on:change={(e) => {
									handleRowValueChanged(e.detail.value, index);
								}}
								size="small"
								readonly={false}
							/>
						</td>
						<td style="min-width: 10px;">
							<div style="margin-top: 5px;">
								{#if row.end}
									{`<`}
								{/if}
							</div>
						</td>
						<td style="width: 100%;">
							<div class="is-size-6" style="margin-top: 5px;">
								{#if row.end}
									{row.end}
								{:else}
									Others
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<!-- </div> -->
	{/if}
</div>

<style lang="scss">
	.value-table {
		thead,
		tbody {
			display: block;
		}
		tbody {
			overflow-x: hidden;
			overflow-y: scroll;
			max-height: 200px;
		}
	}
</style>
