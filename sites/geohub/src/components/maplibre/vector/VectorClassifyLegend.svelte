<script lang="ts">
	import { page } from '$app/stores';
	import LegendColorMapRow from '$components/maplibre/LegendColorMapRow.svelte';
	import PropertySelect from '$components/maplibre/symbol/PropertySelect.svelte';
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import NumberInput from '$components/util/NumberInput.svelte';
	import {
		ClassificationMethodTypes,
		ClassificationMethods,
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		NumberOfRandomSamplingPoints,
		UniqueValueThreshold,
		VectorApplyToTypes
	} from '$lib/config/AppConfig';
	import {
		checkVectorLayerHighlySkewed,
		getIntervalList,
		getLayerProperties,
		getLayerStyle,
		getLineWidth,
		getMaxValueOfCharsInIntervals,
		getSampleFromInterval,
		isVectorIntervalExpression,
		remapInputValue,
		updateIntervalValues
	} from '$lib/helper';
	import type {
		ColorMapRow,
		SpriteImage,
		VectorLayerTileStatAttribute,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import {
		APPLY_TO_OPTION_CONTEXT_KEY,
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		type ApplyToOptionStore,
		type ClassificationMethodStore,
		type ColorMapNameStore,
		type MapStore,
		type NumberOfClassesStore,
		type SpriteImageStore
	} from '$stores';
	import { Radios, type Radio } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import { hexToCSSFilter } from 'hex-to-css-filter';
	import { debounce } from 'lodash-es';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onDestroy, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const spriteImageList: SpriteImageStore = getContext(SPRITEIMAGE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);
	const classificationMethodStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY
	);
	const numberOfClassesStore: NumberOfClassesStore = getContext(NUMBER_OF_CLASSES_CONTEXT_KEY);
	const applyToOptionStore: ApplyToOptionStore = getContext(APPLY_TO_OPTION_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	export let defaultColor: string;

	let layerMax: number;
	let layerMin: number;

	// let classificationMethodsDefault = ClassificationMethods;
	let classificationMethods = ClassificationMethods;
	let layerStyle = getLayerStyle($map, layerId);
	let layerType = layerStyle.type;
	let cssIconFilter: string;
	let icon: SpriteImage;
	let rowWidth: number;
	let sizeArray: number[];
	let highlySkewed: boolean;
	let hasUniqueValues = false;
	let propertySelectValue;
	// let numberOfClasses: number;
	let colorMapRows: ColorMapRow[];
	let randomSample: { [key: string]: number[] } = {};

	let containerWidth: number;
	let numberOfClassesWidth: number;
	$: colormapPickerWidth = hasUniqueValues ? containerWidth : containerWidth - numberOfClassesWidth;

	// update layer store upon change of apply to option
	// let applyToOption: VectorApplyToTypes;
	$: $applyToOptionStore, updateMap();
	let applyToOptions: Radio[] = [
		{
			label: layerType === 'symbol' ? 'Icon color' : 'Line color',
			value: VectorApplyToTypes.COLOR
		},
		{
			label: layerType === 'symbol' ? 'Icon size' : 'Line width',
			value: VectorApplyToTypes.SIZE
		}
	];

	if (layerStyle.type === 'line') {
		if (isVectorIntervalExpression($map, layerId, 'line-color')) {
			$applyToOptionStore = VectorApplyToTypes.COLOR;
		} else if (isVectorIntervalExpression($map, layerId, 'line-width')) {
			$applyToOptionStore = VectorApplyToTypes.SIZE;
		}
	} else if (layerStyle.type === 'symbol') {
		if (isVectorIntervalExpression($map, layerId, 'icon-color')) {
			$applyToOptionStore = VectorApplyToTypes.COLOR;
		} else if (isVectorIntervalExpression($map, layerId, 'icon-size')) {
			$applyToOptionStore = VectorApplyToTypes.SIZE;
		}
	}
	if (!$applyToOptionStore) {
		$applyToOptionStore = VectorApplyToTypes.COLOR;
	}

	const initialise = () => {
		return new Promise<void>((resolve) => {
			if (layerType === 'symbol') {
				icon = $spriteImageList.find((icon) => icon.alt === getIconImageName());
			}
			getPropertySelectValue();
			setCssIconFilter();
			getColorMapRows();

			resetClassificationMethods();

			$map?.on('zoom', updateMap);
			$map?.on('icon-color:changed', setCssIconFilter);
			resolve();
		});
	};

	onDestroy(() => {
		if (!$map) return;
		$map.off('zoom', updateMap);
	});

	const resetClassificationMethods = () => {
		classificationMethods = ClassificationMethods;
		highlySkewed = checkVectorLayerHighlySkewed(
			metadata,
			layerStyle['source-layer'],
			propertySelectValue
		);
		if (highlySkewed) {
			if (!$classificationMethodStore) {
				$classificationMethodStore = ClassificationMethodTypes.LOGARITHMIC;
			}
		} else {
			classificationMethods = ClassificationMethods.filter(
				(c) => c.code !== ClassificationMethodTypes.LOGARITHMIC
			);
		}
		if (
			$classificationMethodStore === ClassificationMethodTypes.LOGARITHMIC &&
			!classificationMethods.find((c) => c.code === ClassificationMethodTypes.LOGARITHMIC)
		) {
			$classificationMethodStore = $page.data.config.ClassificationMethod;
		}
	};

	const setCssIconFilter = () => {
		const rgba = chroma(defaultColor).rgba();
		cssIconFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex()).filter;
	};

	const getIconImageName = () => {
		const propertyName = 'icon-image';
		const style = $map
			.getStyle()
			.layers.filter((mapLayer: LayerSpecification) => mapLayer.id === layerId)[0];
		return style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle';
	};

	const getPropertySelectValue = () => {
		const vectorLayerMeta = getLayerProperties($map, layerId, metadata);
		const selectOptions = Object.keys(vectorLayerMeta.fields);

		propertySelectValue = selectOptions[0];

		if ($applyToOptionStore === VectorApplyToTypes.COLOR) {
			const propertyName = layerType === 'symbol' ? 'icon-color' : 'line-color';
			const colorValue = $map.getPaintProperty(layerId, propertyName);
			if (colorValue && Object.prototype.hasOwnProperty.call(colorValue, 'property')) {
				propertySelectValue = colorValue['property'];
			}
		} else {
			const propertyName = layerType === 'symbol' ? 'icon-size' : 'line-width';
			const sizeValue =
				layerType === 'symbol'
					? $map.getLayoutProperty(layerId, propertyName)
					: $map.getPaintProperty(layerId, propertyName);
			if (sizeValue && Object.prototype.hasOwnProperty.call(sizeValue, 'property')) {
				propertySelectValue = sizeValue['property'];
			}
		}
	};

	const getColorMapRows = () => {
		let stops: [[number | string, string]];

		if ($applyToOptionStore === VectorApplyToTypes.COLOR) {
			const propertyName = layerType === 'symbol' ? 'icon-color' : 'line-color';
			const colorValue = $map.getPaintProperty(layerId, propertyName);
			if (colorValue && Object.prototype.hasOwnProperty.call(colorValue, 'stops')) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				stops = colorValue.stops;
			}
		} else {
			const propertyName = layerType === 'symbol' ? 'icon-size' : 'line-width';
			const sizeValue =
				layerType === 'symbol'
					? $map.getLayoutProperty(layerId, propertyName)
					: $map.getPaintProperty(layerId, propertyName);
			if (sizeValue && Object.prototype.hasOwnProperty.call(sizeValue, 'stops')) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				stops = sizeValue.stops;
			}
		}

		colorMapRows = [];

		const stats = metadata.json.tilestats?.layers.find(
			(l) => l.layer === layerStyle['source-layer']
		);
		const stat = stats?.attributes.find((val) => val.attribute === propertySelectValue);
		stat.values && stat.values.length <= UniqueValueThreshold
			? (hasUniqueValues = true)
			: (hasUniqueValues = false);
		if (!layerMax) {
			if (stat?.max) {
				layerMax = stat.max;
			}
		}
		stops?.forEach((stop, index: number) => {
			const value: number | string = stop[0];
			const color: string = stop[1];
			colorMapRows.push({
				color: chroma(color).rgba(),
				index: index,
				start: value,
				end: hasUniqueValues ? value : index < stops.length - 1 ? stops[index + 1][0] : layerMax
			});
		});
		$numberOfClassesStore =
			colorMapRows.length === 0 ? $page.data.config.NumberOfClasses : colorMapRows.length;
	};

	const handleColormapNameChanged = () => {
		const isReverse = $colorMapNameStore.indexOf('_r') !== -1;
		let scaleColorList = chroma
			.scale($colorMapNameStore.replace('_r', ''))
			.mode('rgb')
			.colors($numberOfClassesStore);
		if (isReverse) {
			scaleColorList = scaleColorList.reverse();
		}
		colorMapRows.forEach((row, index) => {
			const color = scaleColorList[index];
			if (!color) return;
			row.color = [...chroma(color).rgb(), 1];
		});
		colorMapRows = [...colorMapRows];
		rowWidth = getMaxValueOfCharsInIntervals(colorMapRows);
		updateMap();
	};

	const handlePropertyChange = (e) => {
		propertySelectValue = e.detail.prop;

		resetClassificationMethods();
		setIntervalValues();
	};

	const handleClassificationChange = () => {
		setIntervalValues();
	};

	const handleIncrementDecrementClasses = () => {
		setIntervalValues();
	};

	const handleParamsUpdate = debounce(() => {
		updateMap();
	}, 500);

	const handleChangeIntervalValues = (event: CustomEvent) => {
		colorMapRows = updateIntervalValues(event, colorMapRows);
		rowWidth = getMaxValueOfCharsInIntervals(colorMapRows);
		updateMap();
	};

	const setIntervalValues = () => {
		// set to default values
		highlySkewed = checkVectorLayerHighlySkewed(
			metadata,
			layerStyle['source-layer'],
			propertySelectValue
		);

		const tilestats = metadata.json?.tilestats;
		if (tilestats) {
			const tileStatLayer = tilestats?.layers.find(
				(tileLayer: VectorLayerTileStatLayer) => tileLayer.layer == layerStyle['source-layer']
			);

			if (tileStatLayer) {
				const tileStatLayerAttribute = tileStatLayer.attributes.find(
					(val: VectorLayerTileStatAttribute) => val.attribute === propertySelectValue
				);

				if (tileStatLayerAttribute) {
					const stats = metadata.json.tilestats?.layers.find(
						(l) => l.layer === layerStyle['source-layer']
					);
					const stat = stats?.attributes.find(
						(val) => val.attribute === tileStatLayerAttribute.attribute
					);

					hasUniqueValues = false;

					if (stat) {
						layerMax = stat.max;
						layerMin = stat.min;

						if (!randomSample[stat.attribute]) {
							randomSample[stat.attribute] = getSampleFromInterval(
								stat.min,
								stat.max,
								NumberOfRandomSamplingPoints
							);
						}
						const sample = randomSample[stat.attribute];

						const propertySelectValues = [];
						const values = stat.values;
						if (
							(values && values.length === 1) ||
							(stat.type !== 'number' &&
								values &&
								values.length > 0 &&
								values.length <= UniqueValueThreshold) ||
							(stat.type === 'number' && values && values.length <= UniqueValueThreshold) ||
							stat.type !== 'number'
						) {
							hasUniqueValues = true;
							$applyToOptionStore = VectorApplyToTypes.COLOR;

							const isReverse = $colorMapNameStore.indexOf('_r') !== -1;

							let scaleColorList = chroma
								.scale($colorMapNameStore.replace('_r', ''))
								.mode('lrgb')
								.colors(values.length);
							if (isReverse) {
								scaleColorList = scaleColorList.reverse();
							}
							for (let i = 0; i < stat.values.length; i++) {
								const color = chroma(scaleColorList[i]).rgb();
								const row: ColorMapRow = {
									index: i,
									color: [...color, 1],
									start: stat.values[i],
									end: stat.values[i]
								};
								propertySelectValues.push(row);
							}
						} else {
							const intervalList = getIntervalList(
								$classificationMethodStore,
								stat.min,
								stat.max,
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
								propertySelectValues.push(row);
							}
						}

						colorMapRows = propertySelectValues;
						rowWidth = getMaxValueOfCharsInIntervals(colorMapRows);
						updateMap();
					}
				}
			}
		}
	};

	const updateMap = () => {
		if (!propertySelectValue) return;
		if (!(colorMapRows && colorMapRows.length > 0)) {
			setIntervalValues();
		}
		const statLayer = metadata.json.tilestats.layers.find(
			(l) => l.layer === layerStyle['source-layer']
		);
		const attribute = statLayer?.attributes.find((attr) => attr.attribute === propertySelectValue);
		const vectorLegendType = attribute.type !== 'number' ? 'categorical' : 'interval';
		let defaultColorValue = 'rgba(0,0,0,0)';

		let stops = colorMapRows.map((row) => {
			return [
				row.start,
				hasUniqueValues === true || $applyToOptionStore === VectorApplyToTypes.COLOR
					? chroma([row.color[0], row.color[1], row.color[2], row.color[3]]).css()
					: remapInputValue(Number(row.end), layerMin, layerMax, 0.5, 10)
			];
		});
		if (stops.length > 0) {
			if (attribute.type === 'number') {
				stops = sortStops(stops);
			}
			if (hasUniqueValues === true || $applyToOptionStore === VectorApplyToTypes.COLOR) {
				if (layerType === 'symbol') {
					const iconSize = $map.getLayoutProperty(layerId, 'icon-size');
					if (!iconSize || (iconSize && ['interval', 'categorical'].includes(iconSize.type))) {
						map.setLayoutProperty(layerId, 'icon-size', 1);
					}
					map.setPaintProperty(layerId, 'icon-color', {
						type: vectorLegendType,
						property: propertySelectValue,
						stops: stops,
						default: defaultColorValue
					});
				} else if (layerType === 'line') {
					map.setPaintProperty(layerId, 'line-width', getLineWidth($map, layerId));
					map.setPaintProperty(layerId, 'line-color', {
						type: vectorLegendType,
						property: propertySelectValue,
						stops: stops,
						default: defaultColorValue
					});
				}
			} else if ($applyToOptionStore === VectorApplyToTypes.SIZE) {
				// Generate new stops based on the zoomLevel
				if (layerType === 'symbol') {
					// Ends are the
					const intervalEnds = colorMapRows.map((item) => item.end);
					const ratioOfRadiustoTheFirstEnd = intervalEnds
						.slice(1)
						.map((item) => (item as number) / Number(intervalEnds[0]));

					// Add 1 to the ratio array
					ratioOfRadiustoTheFirstEnd.unshift(1);

					// newStops array, that takes into considerarion the ratio and the zoomLevel
					const newStops = stops.map((item, index) => {
						let ratio = 1;
						if (ratioOfRadiustoTheFirstEnd[index]) {
							ratio = (ratioOfRadiustoTheFirstEnd[index] as number) * ($map.getZoom() / 10);
						}
						return [item[0], ratio];
					});
					map.setPaintProperty(layerId, 'icon-color', defaultColor);
					map.setLayoutProperty(layerId, 'icon-size', {
						property: propertySelectValue,
						type: 'interval',
						stops: newStops,
						default: 0
					});
				} else if (layerType === 'line') {
					const newStops = stops.map((item) => [
						item[0] as number,
						(item[1] as number) / $map.getZoom()
					]);

					sizeArray = newStops.map((item) => item[1]);
					map.setPaintProperty(layerId, 'line-color', defaultColor);
					map.setPaintProperty(layerId, 'line-width', {
						property: propertySelectValue,
						type: 'interval',
						stops: newStops,
						default: 0
					});
				}
			}
		}
	};

	const sortStops = (stops: (string | number)[][]) => {
		stops = stops.sort((first, second) => {
			if (first[0] > second[0]) {
				return 1;
			} else if (first[0] < second[0]) {
				return -1;
			} else {
				return 0;
			}
		});
		return stops;
	};

	let isInitialising = initialise();

	onMount(() => {
		classificationMethodStore.subscribe(() => {
			handleClassificationChange();
		});
	});
</script>

<div class="advanced-container" data-testid="advanced-container" bind:clientWidth={containerWidth}>
	{#await isInitialising then}
		<div class="columns is-mobile">
			<div class="column">
				<FieldControl title="Property">
					<div slot="help">Select a property to classify legend</div>
					<div slot="control">
						<PropertySelect
							bind:propertySelectValue
							on:select={handlePropertyChange}
							{layerId}
							{metadata}
							onlyNumberFields={false}
						/>
					</div>
				</FieldControl>
			</div>
			{#if hasUniqueValues === false}
				<div class="column is-4">
					<FieldControl title="Apply To">
						<div slot="help">Select the type of legend which apply to</div>
						<div slot="control">
							<Radios
								bind:radios={applyToOptions}
								bind:value={$applyToOptionStore}
								groupName="layer-type-{layerId}}"
								isVertical={true}
							/>
						</div>
					</FieldControl>
				</div>
			{/if}
		</div>

		<div class="is-flex">
			{#if !hasUniqueValues}
				<div class="py-1 pr-2" bind:clientWidth={numberOfClassesWidth}>
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
			{/if}
			{#if $applyToOptionStore === VectorApplyToTypes.COLOR || hasUniqueValues}
				<FieldControl title="Colormap">
					<div slot="help">Apply a colormap to classify legend</div>
					<div slot="control" style="width: {colormapPickerWidth}px;">
						<ColorMapPicker
							bind:colorMapName={$colorMapNameStore}
							on:colorMapChanged={handleColormapNameChanged}
							isFullWidth={true}
						/>
					</div>
				</FieldControl>
			{/if}
		</div>

		<div class="colormap-rows-container">
			{#if $applyToOptionStore === VectorApplyToTypes.COLOR}
				{#each colorMapRows as colorMapRow}
					<LegendColorMapRow
						bind:colorMapRow
						bind:colorMapName={$colorMapNameStore}
						bind:rowWidth
						on:changeColorMap={handleParamsUpdate}
						bind:hasUniqueValues
						on:changeIntervalValues={handleChangeIntervalValues}
					/>
				{/each}
			{:else if $applyToOptionStore === VectorApplyToTypes.SIZE}
				<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
					<thead>
						<tr>
							<th>{layerType === 'symbol' ? 'Icon' : 'Line'}</th>
							<th>Start</th>
							<th>End</th>
						</tr>
					</thead>
					<tbody>
						{#if layerType === 'symbol'}
							{#each colorMapRows as row}
								{@const size = remapInputValue(Number(row.end), layerMin, layerMax, 10, 20)}
								<tr data-testid="icon-size-row-container">
									<td class="has-text-centered">
										{#key cssIconFilter}
											{#if icon}
												<img
													src={icon.src}
													alt={icon.alt}
													style={`width: ${size}px; height: ${size}px; filter: ${cssIconFilter}`}
												/>
											{/if}
										{/key}
									</td>
									<td>{row.start}</td>
									<td>{row.end}</td>
								</tr>
							{/each}
						{:else if layerType === 'line'}
							{#if sizeArray && sizeArray.length > 0}
								{#each colorMapRows as row, index}
									<tr data-testid="line-width-row-container">
										<td class="has-text-centered">
											<div
												style={`margin-top: 5px; width: 100px; height: ${sizeArray[index]}px; background-color: ${defaultColor};`}
											/>
										</td>
										<td>{row.start}</td>
										<td>{row.end}</td>
									</tr>
								{/each}
							{/if}
						{/if}
					</tbody>
				</table>
			{/if}
		</div>
	{/await}
</div>

<style lang="scss">
	div {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.advanced-container {
		.colormap-rows-container {
			overflow-y: auto;
			max-height: 200px;
		}
	}
</style>
