<script lang="ts">
	import { page } from '$app/stores';
	import VectorLine from '$components/maplibre/line/VectorLine.svelte';
	import IconColor from '$components/maplibre/symbol/IconColor.svelte';
	import IconImage from '$components/maplibre/symbol/IconImage.svelte';
	import IconOverlap from '$components/maplibre/symbol/IconOverlap.svelte';
	import IconSize from '$components/maplibre/symbol/IconSize.svelte';
	import PropertySelect from '$components/maplibre/symbol/PropertySelect.svelte';
	import LegendColorMapRow from '$components/pages/map/layers/LegendColorMapRow.svelte';
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
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
		getIntervalList,
		getLayerProperties,
		getLayerStyle,
		getLineWidth,
		getMaxValueOfCharsInIntervals,
		getSampleFromInterval,
		remapInputValue,
		updateIntervalValues
	} from '$lib/helper';
	import type {
		ColorMapRow,
		Layer,
		SpriteImage,
		VectorLayerTileStatAttribute,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		COLORMAP_NAME_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		type ClassificationMethodStore,
		type ColorMapNameStore,
		type MapStore,
		type SpriteImageStore
	} from '$stores';
	import { Radios, type Radio } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import { hexToCSSFilter } from 'hex-to-css-filter';
	import { debounce } from 'lodash-es';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onDestroy } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const spriteImageList: SpriteImageStore = getContext(SPRITEIMAGE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);
	const classificationMethodStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY
	);

	export let applyToOption: VectorApplyToTypes;
	export let layer: Layer;

	export let defaultColor: string;

	let layerMax: number;
	let layerMin: number;

	// update layer store upon change of apply to option
	$: applyToOption, updateMap();

	// let classificationMethodsDefault = ClassificationMethods;
	let classificationMethods = ClassificationMethods;
	let layerStyle = getLayerStyle($map, layer.id);
	let layerType = layerStyle.type;
	let cssIconFilter: string;
	let icon: SpriteImage;
	let rowWidth: number;
	let sizeArray: number[];
	let highlySkewed: boolean;
	let hasUniqueValues = false;
	let propertySelectValue;
	let numberOfClasses: number;
	let colorMapRows: ColorMapRow[];
	let randomSample: { [key: string]: number[] } = {};

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
		highlySkewed = checkHighlySkewed();
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

	const checkHighlySkewed = () => {
		let isHighlySkewed = false;
		const metadata = layer?.info as VectorTileMetadata;
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
					const stats = (layer.info as VectorTileMetadata).json.tilestats?.layers.find(
						(l) => l.layer === layerStyle['source-layer']
					);
					const stat = stats?.attributes.find(
						(val) => val.attribute === tileStatLayerAttribute.attribute
					);
					const skewness = 3 * ((stat['mean'] - stat['median']) / stat['std']);
					// https://community.gooddata.com/metrics-and-maql-kb-articles-43/normality-testing-skewness-and-kurtosis-241
					// If skewness is less than -1 or greater than 1, the distribution is highly skewed.
					// If skewness is between -1 and -0.5 or between 0.5 and 1, the distribution is moderately skewed.
					// If skewness is between -0.5 and 0.5, the distribution is approximately symmetric.
					isHighlySkewed = skewness < -1 && skewness > 1;
				}
			}
		}
		return isHighlySkewed;
	};

	const setCssIconFilter = () => {
		if (layerType === 'fill') return;
		const rgba = chroma(defaultColor).rgba();
		cssIconFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex()).filter;
	};

	const getIconImageName = () => {
		const propertyName = 'icon-image';
		const style = $map
			.getStyle()
			.layers.filter((mapLayer: LayerSpecification) => mapLayer.id === layer.id)[0];
		return style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle';
	};

	const getPropertySelectValue = () => {
		const vectorLayerMeta = getLayerProperties($map, layer);
		const selectOptions = Object.keys(vectorLayerMeta.fields);

		propertySelectValue = selectOptions[0];

		if (layerType === 'fill') {
			const fillColorValue = $map.getPaintProperty(layer.id, 'fill-color');
			if (fillColorValue && Object.prototype.hasOwnProperty.call(fillColorValue, 'property')) {
				propertySelectValue = fillColorValue['property'];
			}
		} else {
			if (applyToOption === VectorApplyToTypes.COLOR) {
				const propertyName = layerType === 'symbol' ? 'icon-color' : 'line-color';
				const colorValue = $map.getPaintProperty(layer.id, propertyName);
				if (colorValue && Object.prototype.hasOwnProperty.call(colorValue, 'property')) {
					propertySelectValue = colorValue['property'];
				}
			} else {
				const propertyName = layerType === 'symbol' ? 'icon-size' : 'line-width';
				const sizeValue =
					layerType === 'symbol'
						? $map.getLayoutProperty(layer.id, propertyName)
						: $map.getPaintProperty(layer.id, propertyName);
				if (sizeValue && Object.prototype.hasOwnProperty.call(sizeValue, 'property')) {
					propertySelectValue = sizeValue['property'];
				}
			}
		}
	};

	const getColorMapRows = () => {
		let stops: [[number | string, string]];
		if (layerType === 'fill') {
			const colorValue = $map.getPaintProperty(layer.id, 'fill-color');
			if (colorValue && Object.prototype.hasOwnProperty.call(colorValue, 'stops')) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				stops = colorValue.stops;
			}
		} else {
			if (applyToOption === VectorApplyToTypes.COLOR) {
				const propertyName = layerType === 'symbol' ? 'icon-color' : 'line-color';
				const colorValue = $map.getPaintProperty(layer.id, propertyName);
				if (colorValue && Object.prototype.hasOwnProperty.call(colorValue, 'stops')) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					stops = colorValue.stops;
				}
			} else {
				const propertyName = layerType === 'symbol' ? 'icon-size' : 'line-width';
				const sizeValue =
					layerType === 'symbol'
						? $map.getLayoutProperty(layer.id, propertyName)
						: $map.getPaintProperty(layer.id, propertyName);
				if (sizeValue && Object.prototype.hasOwnProperty.call(sizeValue, 'stops')) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					stops = sizeValue.stops;
				}
			}
		}

		colorMapRows = [];

		const stats = (layer.info as VectorTileMetadata).json.tilestats?.layers.find(
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
		numberOfClasses =
			colorMapRows.length === 0 ? $page.data.config.NumberOfClasses : colorMapRows.length;
	};

	const handleColormapNameChanged = () => {
		const scaleColorList = chroma.scale($colorMapNameStore).mode('rgb').colors(numberOfClasses);
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
		highlySkewed = highlySkewed = checkHighlySkewed();

		const metadata = layer?.info as VectorTileMetadata;
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
					const stats = (layer.info as VectorTileMetadata).json.tilestats?.layers.find(
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
							(stat.type === 'number' && values && values.length <= UniqueValueThreshold)
						) {
							hasUniqueValues = true;
							applyToOption = VectorApplyToTypes.COLOR;

							const scaleColorList = chroma
								.scale($colorMapNameStore)
								.mode('lrgb')
								.colors(values.length);

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
								numberOfClasses
							);
							const scaleColorList = chroma.scale($colorMapNameStore).classes(intervalList);

							// create interval list (start / end)
							for (let i = 0; i < intervalList.length - 1; i++) {
								const row: ColorMapRow = {
									index: i,
									color: [...scaleColorList(intervalList[i]).rgb(), 1],
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
		const vectorInfo = layer.info as VectorTileMetadata;
		const statLayer = vectorInfo.json.tilestats.layers.find(
			(l) => l.layer === layerStyle['source-layer']
		);
		const attribute = statLayer?.attributes.find((attr) => attr.attribute === propertySelectValue);
		const vectorLegendType = attribute.type !== 'number' ? 'categorical' : 'interval';
		let defaultColorValue = 'rgba(0,0,0,0)';
		if (layerType === 'fill') {
			let stops = colorMapRows.map((row) => {
				const rgb = `rgba(${row.color[0]}, ${row.color[1]}, ${row.color[2]}, ${row.color[3]})`;
				return [row.start, rgb];
			});
			if (attribute.type === 'number') {
				stops = sortStops(stops);
			}

			let outlineStops = colorMapRows.map((row) => {
				const hex = chroma([row.color[0], row.color[1], row.color[2], row.color[3]]).hex();
				const rgb = chroma(hex).darken(2.6).rgb(true);
				const cssColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${row.color[3]})`;
				return [row.start, cssColor];
			});
			if (attribute.type === 'number') {
				outlineStops = sortStops(outlineStops);
			}
			map.setPaintProperty(layer.id, 'fill-outline-color', {
				property: propertySelectValue,
				type: vectorLegendType,
				stops: outlineStops,
				default: defaultColorValue
			});
			map.setPaintProperty(layer.id, 'fill-color', {
				type: vectorLegendType,
				property: propertySelectValue,
				stops: stops,
				default: defaultColorValue
			});
		} else {
			let stops = colorMapRows.map((row) => {
				return [
					row.start,
					hasUniqueValues === true || applyToOption === VectorApplyToTypes.COLOR
						? chroma([row.color[0], row.color[1], row.color[2], row.color[3]]).css()
						: remapInputValue(Number(row.end), layerMin, layerMax, 0.5, 10)
				];
			});
			if (stops.length > 0) {
				if (attribute.type === 'number') {
					stops = sortStops(stops);
				}
				if (hasUniqueValues === true || applyToOption === VectorApplyToTypes.COLOR) {
					if (layerType === 'symbol') {
						const iconSize = $map.getLayoutProperty(layer.id, 'icon-size');
						if (!iconSize || (iconSize && ['interval', 'categorical'].includes(iconSize.type))) {
							map.setLayoutProperty(layer.id, 'icon-size', 1);
						}
						map.setPaintProperty(layer.id, 'icon-color', {
							type: vectorLegendType,
							property: propertySelectValue,
							stops: stops,
							default: defaultColorValue
						});
					} else if (layerType === 'line') {
						map.setPaintProperty(layer.id, 'line-width', getLineWidth($map, layer.id));
						map.setPaintProperty(layer.id, 'line-color', {
							type: vectorLegendType,
							property: propertySelectValue,
							stops: stops,
							default: defaultColorValue
						});
					}
				} else if (applyToOption === VectorApplyToTypes.SIZE) {
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
						map.setPaintProperty(layer.id, 'icon-color', defaultColor);
						map.setLayoutProperty(layer.id, 'icon-size', {
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
						map.setPaintProperty(layer.id, 'line-color', defaultColor);
						map.setPaintProperty(layer.id, 'line-width', {
							property: propertySelectValue,
							type: 'interval',
							stops: newStops,
							default: 0
						});
					}
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
</script>

<div class="advanced-container" data-testid="advanced-container">
	{#await isInitialising then}
		{#if layerType === 'symbol'}
			<div class="columns is-mobile px-2 py-2">
				<div class="column is-flex is-justify-content-center p-0">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label has-text-centered">Icon</label>
						<div class="control">
							<IconImage bind:layerId={layer.id} bind:defaultColor />
						</div>
					</div>
				</div>
				<div class="column is-flex is-justify-content-center p-0 pl-2">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label has-text-centered">Overlap Priority</label>
						<div class="control pt-1">
							<IconOverlap bind:layerId={layer.id} />
						</div>
					</div>
				</div>

				{#if applyToOption === VectorApplyToTypes.SIZE}
					<div class="column is-flex is-justify-content-center p-0 pl-2">
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label has-text-centered">Color</label>
							<div class="control pl-2 pt-2">
								<IconColor bind:layerId={layer.id} bind:defaultColor />
							</div>
						</div>
					</div>
				{/if}
				{#if hasUniqueValues || applyToOption === VectorApplyToTypes.COLOR}
					<div class="column is-flex is-justify-content-center p-0 pl-2">
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label has-text-centered">Size</label>
							<div class="control">
								<IconSize bind:layerId={layer.id} />
							</div>
						</div>
					</div>
				{/if}
			</div>
		{:else if layerType === 'line'}
			<VectorLine
				bind:layerId={layer.id}
				bind:defaultColor
				showLineColor={applyToOption === VectorApplyToTypes.SIZE}
				showLineWidth={hasUniqueValues || applyToOption === VectorApplyToTypes.COLOR}
			/>
		{/if}
		<div class="columns is-mobile">
			<div class="column">
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label has-text-centered">Property:</label>
					<div class="control">
						<PropertySelect
							bind:propertySelectValue
							on:select={handlePropertyChange}
							{layer}
							inLegend={true}
						/>
					</div>
				</div>
			</div>
			{#if layerType !== 'fill' && hasUniqueValues === false}
				<div class="column is-4">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label has-text-centered">Apply To</label>
						<div class="control">
							<div class="is-flex is-justify-content-center">
								<Radios
									bind:radios={applyToOptions}
									bind:value={applyToOption}
									groupName="layer-type-{layer.id}}"
									isVertical={true}
								/>
							</div>
						</div>
					</div>
				</div>
			{/if}
			{#if applyToOption === VectorApplyToTypes.COLOR || layerStyle.type === 'fill' || hasUniqueValues}
				<div class="column is-3">
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label has-text-centered">Colormap:</label>
						<div class="control">
							<div class="is-flex is-justify-content-center">
								<ColorMapPicker
									bind:colorMapName={$colorMapNameStore}
									on:colorMapChanged={handleColormapNameChanged}
								/>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="legend-controls">
			{#if hasUniqueValues === false}
				<div class="field pr-2">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label has-text-centered">Classification</label>
					<div class="control">
						<div class="select is-normal">
							<select
								bind:value={$classificationMethodStore}
								on:change={handleClassificationChange}
								style="width: 110px;"
								title="Classification Methods"
							>
								{#each classificationMethods as classificationMethod}
									<option
										class="legend-text"
										title="Classification Method"
										value={classificationMethod.code}>{classificationMethod.name}</option
									>
								{/each}
							</select>
						</div>
					</div>
				</div>
				<div class="number-classes field pr-2">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label has-text-centered">Number of Classes</label>
					<div class="control">
						<NumberInput
							bind:value={numberOfClasses}
							minValue={NumberOfClassesMinimum}
							maxValue={NumberOfClassesMaximum}
							on:change={handleIncrementDecrementClasses}
						/>
					</div>
				</div>
			{/if}
		</div>
		<div class="columns">
			<div class="column size">
				<div>
					{#if layerType === 'fill' || applyToOption === VectorApplyToTypes.COLOR}
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
					{:else if applyToOption === VectorApplyToTypes.SIZE}
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
			</div>
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
		.size {
			padding-left: 15px;
		}

		.legend-controls {
			display: flex;
			justify-content: flex-start;
			align-items: center;

			.number-classes {
				margin: 0 auto;
			}
		}
	}
</style>
