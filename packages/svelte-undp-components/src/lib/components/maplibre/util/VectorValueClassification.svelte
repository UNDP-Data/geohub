<script lang="ts">
	import FieldControl from '$lib/components/ui/FieldControl.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import {
		ClassificationMethods,
		ClassificationMethodTypes
	} from '$lib/constants/ClassificationMethod.js';
	import type { VectorTileMetadata } from '$lib/interfaces/VectorTileMetadata.js';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { checkVectorLayerHighlySkewed } from '$lib/util/checkVectorLayerHighlySkewed.js';
	import { convertFunctionToExpression } from '$lib/util/convertFunctionToExpression.js';
	import { getIntervalList } from '$lib/util/getIntervalList.js';
	import { getSampleFromHistogram } from '$lib/util/getSampleFromHistogram.js';
	import { getSampleFromInterval } from '$lib/util/getSampleFromInterval.js';
	import { debounce } from 'lodash-es';
	import { getContext, onMount, untrack } from 'svelte';
	import type { ColorMapRow } from './LegendColorMapRow.svelte';
	import PropertySelect from './PropertySelect.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		metadata: VectorTileMetadata;
		defaultValue: number;
		maxValue: number;
		minValue: number;
		propertyName: string;
		stepValue: number;
		legendCssTemplate: string; // should include {value} for the replacement
		styleType?: 'layout' | 'paint';
		dataLabel?: string;
		numberOfClasses: number;
		numberOfClassesMinimum?: number;
		numberOfClassesMaximum?: number;
		defaultNumberOfClasses?: number;
		classificationMethod?: ClassificationMethodTypes;
		numberOfRandomSamplingPoints?: number;
	}

	let {
		layerId = $bindable(),
		metadata = $bindable(),
		defaultValue = $bindable(),
		maxValue = $bindable(),
		minValue = $bindable(),
		propertyName = $bindable(),
		stepValue = $bindable(),
		legendCssTemplate = $bindable(),
		styleType = $bindable('paint'),
		dataLabel = $bindable('Value'),
		numberOfClasses = $bindable(),
		numberOfClassesMinimum = $bindable(2),
		numberOfClassesMaximum = $bindable(25),
		defaultNumberOfClasses = $bindable(5),
		classificationMethod = $bindable(ClassificationMethodTypes.NATURAL_BREAK),
		numberOfRandomSamplingPoints = $bindable(1000)
	}: Props = $props();

	const maplibreLayerId = $map.getLayer(layerId)?.sourceLayer as string;
	let statLayer = metadata.json?.tilestats?.layers?.find((l) => l.layer === maplibreLayerId);

	let colorMapRows: ColorMapRow[] = $state([]);
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

	let value: unknown = $state(getValue());
	const getDefaultPropertyValue = () => {
		return Array.isArray(value) ? value[1][1] : '';
	};
	let propertySelectValue = $state(getDefaultPropertyValue());

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
		if (!classificationMethod) {
			const highlySkewed = checkVectorLayerHighlySkewed(
				metadata,
				maplibreLayerId,
				propertySelectValue
			);
			if (highlySkewed) {
				classificationMethod = ClassificationMethodTypes.LOGARITHMIC;
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
			const attribute = statLayer?.attributes?.find((a) => a.attribute === propertySelectValue);
			for (let i = 2; i < values.length; i = i + 2) {
				const attrValue = values[i + 1];

				const row: ColorMapRow = {
					index: rows.length,
					value: values[i] as number,
					start: rows.length === 0 ? attribute?.min : rows[rows.length - 1].end,
					end: (attrValue as number) ?? undefined
				};
				rows.push(row);
			}
			numberOfClasses = rows.length;
		} else {
			numberOfClasses = defaultNumberOfClasses;
		}
		return rows;
	};

	const updateColorMapRows = () => {
		if (!$map) return;
		if (propertySelectValue.length === 0) {
			colorMapRows = [];
			return;
		}
		const attribute = statLayer?.attributes?.find((a) => a.attribute === propertySelectValue);
		if (!attribute) return;
		colorMapRows = [];

		if (!randomSample[attribute.attribute]) {
			if (attribute.values) {
				randomSample[attribute.attribute] = attribute.values as number[];
			} else if (attribute.histogram) {
				randomSample[attribute.attribute] = getSampleFromHistogram(
					attribute.histogram,
					numberOfRandomSamplingPoints
				);
			} else {
				randomSample[attribute.attribute] = getSampleFromInterval(
					attribute.min as number,
					attribute.max as number,
					numberOfRandomSamplingPoints
				);
			}
		}
		const sample = randomSample[attribute.attribute];
		const intervalList = getIntervalList(
			classificationMethod,
			attribute.min as number,
			attribute.max as number,
			sample,
			numberOfClasses - 1 // the last row is for default value
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
	$effect(() => {
		if (classificationMethod) {
			untrack(() => {
				handleClassificationMethodChanged();
			});
		}
	});
	let isConstantValue = $derived(propertySelectValue?.length === 0);
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
				onchange={setValue}
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
									onchange={handleClassificationMethodChanged}
								>
									{#each ClassificationMethods as classificationMethod}
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
			<div class="column pl-1">
				<FieldControl title="Classes">
					{#snippet help()}
						<div>Increate or decrease the number of classes</div>
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
							<div style={legendCssTemplate.replace(/{value}/g, `${row.value}`)}></div>
						</td>
						<td style="min-width: 100px;">
							<NumberInput
								bind:value={row.value as number}
								{minValue}
								{maxValue}
								bind:step={stepValue}
								onchange={(value: number) => {
									handleRowValueChanged(value, index);
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
