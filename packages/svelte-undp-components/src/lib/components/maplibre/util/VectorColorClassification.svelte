<script lang="ts">
	import ColorMapPicker from '$lib/components/ui/ColorMapPicker.svelte';
	import FieldControl from '$lib/components/ui/FieldControl.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import {
		ClassificationMethods,
		ClassificationMethodTypes
	} from '$lib/constants/ClassificationMethod';
	import type { VectorTileMetadata } from '$lib/interfaces/VectorTileMetadata';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { checkVectorLayerHighlySkewed } from '$lib/util/checkVectorLayerHighlySkewed';
	import { convertFunctionToExpression } from '$lib/util/convertFunctionToExpression';
	import { getIntervalList } from '$lib/util/getIntervalList';
	import { getSampleFromHistogram } from '$lib/util/getSampleFromHistogram';
	import { getSampleFromInterval } from '$lib/util/getSampleFromInterval';
	import { updateIntervalValues } from '$lib/util/updateIntervalValues';
	import chroma from 'chroma-js';
	import { debounce } from 'lodash-es';
	import { getContext, onMount, untrack } from 'svelte';
	import type { ColorMapRow } from './LegendColorMapRow.svelte';
	import LegendColorMapRow from './LegendColorMapRow.svelte';
	import MaplibreColorPicker from './MaplibreColorPicker.svelte';
	import PropertySelect from './PropertySelect.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		metadata: VectorTileMetadata;
		propertyName:
			| 'fill-extrusion-color'
			| 'fill-color'
			| 'line-color'
			| 'icon-color'
			| 'circle-color'
			| 'text-color';
		transparentColor?: number[];
		onlyNumberFields?: boolean;
		numberOfClasses: number;
		numberOfClassesMinimum?: number;
		numberOfClassesMaximum?: number;
		defaultNumberOfClasses?: number;
		classificationMethod?: ClassificationMethodTypes;
		numberOfRandomSamplingPoints?: number;
		uniqueValueThreshold?: number;
		colorMapName?: string;
		defaultColor?: string;
	}

	let {
		layerId = $bindable(),
		metadata = $bindable(),
		propertyName = $bindable(),
		transparentColor = $bindable([255, 255, 255, 0]),
		onlyNumberFields = $bindable(false),
		numberOfClasses = $bindable(),
		numberOfClassesMinimum = $bindable(2),
		numberOfClassesMaximum = $bindable(25),
		defaultNumberOfClasses = $bindable(5),
		classificationMethod = $bindable(ClassificationMethodTypes.NATURAL_BREAK),
		numberOfRandomSamplingPoints = $bindable(1000),
		uniqueValueThreshold = $bindable(25),
		colorMapName = $bindable(''),
		defaultColor = $bindable('')
	}: Props = $props();

	const getVectorDefaultColor = (
		layerId: string,
		property:
			| 'icon-color'
			| 'fill-color'
			| 'fill-outline-color'
			| 'line-color'
			| 'fill-extrusion-color'
			| 'circle-color'
			| 'text-color',
		defaultColor?: string
	): string => {
		if (!$map.getLayer(layerId)) return '#000000';
		let color = $map.getPaintProperty(layerId, property);

		if (
			!color ||
			(color &&
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				(color.type === 'interval' || (color && color.type === 'categorical')))
		) {
			if (property === 'fill-outline-color') {
				color = chroma(defaultColor as string)
					.darken(2.5)
					.hex();
			} else {
				color = chroma.random().hex();
			}
		} else if (Array.isArray(color)) {
			color = chroma.random().hex();
		}
		return color as string;
	};

	defaultColor = getVectorDefaultColor(layerId, propertyName);

	const maplibreLayerId = $map.getLayer(layerId)?.sourceLayer;
	let statLayer = metadata.json?.tilestats?.layers?.find((l) => l.layer === maplibreLayerId);

	let containerWidth: number = $state(0);

	let isUniqueValue = $state(false);

	const getColor = (): string | string[] => {
		let color = $map.getPaintProperty(layerId, propertyName);
		if (!color) {
			color = defaultColor;
		}

		if (Array.isArray(color) && color[0] === 'case') {
			color = color[2];
		}

		color = convertFunctionToExpression(
			color,
			chroma(transparentColor as unknown as chroma.ChromaInput).hex()
		);
		return color as string | string[];
	};

	const resetClassificationMethods = () => {
		if (!classificationMethod && maplibreLayerId) {
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

	let value = $state(getColor());
	const getDefaultPropertyValue = () => {
		return Array.isArray(value) ? value[1][1] : '';
	};
	let propertySelectValue = $state(getDefaultPropertyValue());

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
			const attribute = statLayer?.attributes?.find((a) => a.attribute === propertySelectValue);
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
			numberOfClasses = rows.length;
		} else {
			numberOfClasses = defaultNumberOfClasses;
		}

		return rows;
	};

	let colorMapRows: ColorMapRow[] = $state([]);
	let randomSample: { [key: string]: number[] } = {};

	onMount(() => {
		resetClassificationMethods();
		colorMapRows = Array.isArray(value) ? restoreColorMapRows() : [];
		updateMapFromRows();
	});

	const handleSetColor = (color: string) => {
		value = color;
		map.setPaintProperty(layerId, propertyName, value);
		defaultColor = color;
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

	const handleChangeIntervalValues = debounce(
		(args: { index: number; id: number | string; value: number }) => {
			colorMapRows = updateIntervalValues(args, colorMapRows);
			updateMapFromRows();
		},
		300
	);

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
		const attribute = statLayer?.attributes?.find((a) => a.attribute === propertySelectValue);
		if (!attribute) return;
		const values = attribute.values;
		isUniqueValue =
			(values && values.length === 1) ||
			(attribute.type !== 'number' &&
				values &&
				values.length > 0 &&
				values.length <= uniqueValueThreshold) ||
			(attribute.type === 'number' && values && values.length <= uniqueValueThreshold) ||
			attribute.type !== 'number';

		colorMapRows = [];
		if (isUniqueValue) {
			const isReverse = colorMapName.indexOf('_r') !== -1;

			// trim and remove empty value from the list
			let cleanedValues = values?.filter((v) => `${v}`.trim() !== '');
			let classes = cleanedValues.length + 1; // create colors including default value
			let scaleColorList = chroma
				.scale(colorMapName.replace('_r', ''))
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
				if (attribute.values) {
					randomSample[attribute.attribute] = attribute.values;
				} else if (attribute.histogram) {
					randomSample[attribute.attribute] = getSampleFromHistogram(
						attribute.histogram,
						numberOfRandomSamplingPoints
					);
				} else {
					randomSample[attribute.attribute] = getSampleFromInterval(
						attribute.min,
						attribute.max,
						numberOfRandomSamplingPoints
					);
				}
			}
			const sample = randomSample[attribute.attribute];
			const intervalList = getIntervalList(
				classificationMethod,
				attribute.min,
				attribute.max,
				sample,
				numberOfClasses
			);
			const isReverse = colorMapName.indexOf('_r') !== -1;
			const scales = chroma.scale(colorMapName.replace('_r', ''));
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
			let color = Array.isArray(value) ? defaultColor : value;
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
					colorSteps.push(`${value}`.trim());
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
			const caseExpr = ['case', ['has', propertySelectValue], colorSteps, 'rgba(0,0,0,0)'];
			map.setPaintProperty(layerId, propertyName, caseExpr);
		}
	};
	let isConstantColor = $derived(propertySelectValue?.length === 0);
	$effect(() => {
		if (classificationMethod) {
			untrack(() => {
				handleClassificationMethodChanged();
			});
		}
	});
</script>

<div class="py-2" bind:clientWidth={containerWidth}>
	<PropertySelect
		bind:propertySelectValue
		onselect={handlePropertyChange}
		{layerId}
		{metadata}
		{onlyNumberFields}
		showEmptyFields={true}
		emptyFieldLabel="Use constant value for color"
	/>

	<div class="pt-2">
		{#if isConstantColor && typeof value === 'string'}
			<div>
				<MaplibreColorPicker bind:rgba={value} onchange={handleSetColor} width="100%" />
			</div>
		{:else if propertySelectValue?.length > 0}
			<div class="is-flex pb-1">
				<div style="width: {containerWidth}px;">
					<ColorMapPicker bind:colorMapName onchange={handleColormapNameChanged} />
				</div>
			</div>

			{#if !isUniqueValue}
				<div class="columns">
					<div class="column is-6 pr-1">
						<FieldControl title="Method">
							{#snippet help()}
								<div>
									Whether to apply a classification method for a vector layer in selected property.
									This setting is only used when you select a property to classify the layer
									appearance.
								</div>
							{/snippet}
							{#snippet control()}
								<div>
									<div class="select is-normal is-fullwidth">
										<select
											bind:value={classificationMethod}
											onchange={handleClassificationMethodChanged}
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
					{#each colorMapRows as colorMapRow, index (colorMapRow.index)}
						<LegendColorMapRow
							bind:colorMapRow={colorMapRows[index]}
							bind:colorMapName
							bind:hasUniqueValues={isUniqueValue}
							onchangeIntervalValues={handleChangeIntervalValues}
							onchangeColorMap={handleRowColorChanged}
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
