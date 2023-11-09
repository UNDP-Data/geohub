<script lang="ts">
	import { page } from '$app/stores';
	import PropertySelect from '$components/maplibre/symbol/PropertySelect.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import NumberInput from '$components/util/NumberInput.svelte';
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
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		type ClassificationMethodStore,
		type MapStore,
		type NumberOfClassesStore
	} from '$stores';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const numberOfClassesStore: NumberOfClassesStore = getContext(NUMBER_OF_CLASSES_CONTEXT_KEY_2);
	const classificationMethodStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY
	);
	$: $classificationMethodStore, handleClassificationMethodChanged();

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

	const maplibreLayerId = $map.getLayer(layerId).sourceLayer;
	let statLayer = metadata.json.tilestats?.layers?.find((l) => l.layer === maplibreLayerId);

	$: isConstantValue = propertySelectValue?.length === 0 ?? false;

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

	let value = getValue();
	let propertySelectValue = Array.isArray(value) ? value[1][1] : '';

	onMount(() => {
		value = getValue();
		resetClassificationMethods();
		colorMapRows = Array.isArray(value) ? restoreColorMapRows() : [];
		console.log(colorMapRows);
		$numberOfClassesStore =
			colorMapRows.length === 0 ? $page.data.config.NumberOfClasses : colorMapRows.length;
	});

	const setValue = () => {
		if (styleType === 'paint') {
			map.setPaintProperty(layerId, propertyName, value);
		} else {
			map.setLayoutProperty(layerId, propertyName, value);
		}
	};

	const resetClassificationMethods = () => {
		const highlySkewed = checkVectorLayerHighlySkewed(
			metadata,
			maplibreLayerId,
			propertySelectValue
		);
		if (highlySkewed) {
			if (!$classificationMethodStore) {
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
		} else {
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
			if (row.end) {
				steps.push(row.end);
			}
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
		/>
	</div>
	{#if isConstantValue && typeof value === 'number'}
		<div class="is-flex">
			<NumberInput bind:value {minValue} {maxValue} bind:step={stepValue} on:change={setValue} />
		</div>
	{/if}
</div>

<div class="pt-2">
	{#if propertySelectValue?.length > 0}
		<div class="py-1 pr-2">
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

		<div class="colormap-rows-container">
			<table class="table is-striped is-narrow is-hoverable is-fullwidth">
				<thead>
					<tr>
						<th>Appearance</th>
						<th>{dataLabel}</th>
						<th></th>
						<th>Breakpoint</th>
					</tr>
				</thead>
				<tbody>
					{#each colorMapRows as row, index}
						<tr data-testid="line-width-row-container">
							<td>
								<div style={legendCssTemplate.replace(/{value}/g, `${row.value}`)} />
							</td>
							<td>
								<NumberInput
									bind:value={row.value}
									{minValue}
									{maxValue}
									bind:step={stepValue}
									on:change={(e) => {
										handleRowValueChanged(e.detail.value, index);
									}}
									size="normal"
								/>
							</td>
							<td>
								{#if row.end}
									{`<`}
								{/if}
							</td>
							<td>
								{#if row.end}
									{row.end}
								{:else}
									Others
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
