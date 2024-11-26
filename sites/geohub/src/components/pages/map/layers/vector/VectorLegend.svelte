<script lang="ts">
	import { page } from '$app/stores';
	import VectorParamsPanel, {
		loadArgumentsInDynamicLayers
	} from '$components/maplibre/vector/VectorParamsPanel.svelte';
	import {
		NumberOfClassesMaximum,
		NumberOfClassesMinimum,
		NumberOfRandomSamplingPoints,
		UniqueValueThreshold
	} from '$lib/config/AppConfig';
	import type { Tag } from '$lib/types';
	import {
		CLASSIFICATION_METHOD_CONTEXT_KEY,
		CLASSIFICATION_METHOD_CONTEXT_KEY_2,
		COLORMAP_NAME_CONTEXT_KEY,
		DEFAULTCOLOR_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY,
		NUMBER_OF_CLASSES_CONTEXT_KEY_2,
		type ClassificationMethodStore,
		type ColorMapNameStore,
		type DefaultColorStore,
		type NumberOfClassesStore
	} from '$stores';
	import {
		Accordion,
		CircleRadius,
		CircleStrokeColor,
		CircleStrokeWidth,
		FillExtrusionBase,
		FillExtrusionHeight,
		FillExtrusionVerticalGradient,
		FillOutlineColor,
		getLayerSourceUrl,
		HeatmapColor,
		HeatmapIntensity,
		HeatmapRadius,
		HeatmapWeight,
		Help,
		IconImage,
		IconOverlap,
		IconSize,
		LinePattern,
		MAPSTORE_CONTEXT_KEY,
		VectorColorClassification,
		VectorValueClassification,
		type MapStore,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const defaultColorStore: DefaultColorStore = getContext(DEFAULTCOLOR_CONTEXT_KEY);

	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);
	const numberOfClassesColorStore: NumberOfClassesStore = getContext(NUMBER_OF_CLASSES_CONTEXT_KEY);
	const classificationMethodColorStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY
	);

	const numberOfClassesValueStore: NumberOfClassesStore = getContext(
		NUMBER_OF_CLASSES_CONTEXT_KEY_2
	);
	const classificationMethodValueStore: ClassificationMethodStore = getContext(
		CLASSIFICATION_METHOD_CONTEXT_KEY_2
	);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let tags: Tag[];

	const style: LayerSpecification = $map
		.getStyle()
		.layers.filter((l: LayerSpecification) => l.id === layerId)[0];

	let expanded: { [key: string]: boolean } = {};
	// to allow only an accordion to be expanded
	let expandedId: string;
	$: {
		let expandedData = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedId
		);
		if (expandedData.length > 0) {
			expandedId = expandedData[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedData[0]] = true;
		}
	}

	let isSimulationLayer = false;
	const checkSimulationLayer = async () => {
		const isFunction = tags?.find((t) => t.key == 'layertype')?.value === 'function';
		if (isFunction) {
			const layerUrl = getLayerSourceUrl($map, layerId) as string;
			const args = await loadArgumentsInDynamicLayers(layerUrl);
			if (args && Object.keys(args).length > 0) {
				expanded = { simulation: true };
				isSimulationLayer = true;
			}
		}
	};

	onMount(() => {
		checkSimulationLayer();

		switch (style.type) {
			case 'symbol':
				expanded['icon'] = true;
				break;
			case 'circle':
				expanded['circle-radius'] = true;
				break;
			case 'fill':
				expanded['fill-color'] = true;
				break;
			case 'fill-extrusion':
				expanded['fill-extrusion-color'] = true;
				break;
			case 'line':
				expanded['line-color'] = true;
				break;
			case 'heatmap':
				expanded['heatmap-color'] = true;
				break;
			default:
				break;
		}
	});

	const getDatasetUrl = () => {
		const layerUrl = getLayerSourceUrl($map, layerId);
		const url = new URL(layerUrl);
		return `${url.origin}${url.pathname}`;
	};
</script>

<div class="legend-container">
	{#if expanded && isSimulationLayer}
		{@const datasetUrl = getDatasetUrl()}
		<Accordion title="Simulation" bind:isExpanded={expanded['simulation']}>
			<div class="pb-2" slot="content">
				<VectorParamsPanel {layerId} {datasetUrl} />
			</div>
			<div slot="buttons">
				<Help>Simulate the dataset dynamically by changing available parameters</Help>
			</div>
		</Accordion>
	{/if}

	{#if style.type === 'heatmap'}
		<Accordion title="Heatmap color" bind:isExpanded={expanded['heatmap-color']}>
			<div class="pb-2" slot="content">
				<HeatmapColor {layerId} />
			</div>
			<div slot="buttons">
				<Help>Defines the color of each pixel based on its density value in a heatmap.</Help>
			</div>
		</Accordion>

		<Accordion title="Heatmap Intensity" bind:isExpanded={expanded['heatmap-intensity']}>
			<div class="pb-2" slot="content">
				<HeatmapIntensity {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					Similar to heatmap weight but controls the intensity of the heatmap globally. Primarily
					used for adjusting the heatmap based on zoom level.
				</Help>
			</div>
		</Accordion>

		<Accordion title="Heatmap Radius" bind:isExpanded={expanded['heatmap-radius']}>
			<div class="pb-2" slot="content">
				<HeatmapRadius {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					Radius of influence of one heatmap point in pixels. Increasing the value makes the heatmap
					smoother, but less detailed.
				</Help>
			</div>
		</Accordion>

		<Accordion title="Heatmap Weight" bind:isExpanded={expanded['heatmap-weight']}>
			<div class="pb-2" slot="content">
				<HeatmapWeight {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					A measure of how much an individual point contributes to the heatmap. A value of 10 would
					be equivalent to having 10 points of weight 1 in the same spot. Especially useful when
					combined with clustering.
				</Help>
			</div>
		</Accordion>
	{:else if style.type === 'symbol'}
		<Accordion title="Icon" bind:isExpanded={expanded['icon']}>
			<div class="pb-2 pl-2" slot="content">
				<IconImage {layerId} readonly={false} />
			</div>
			<div slot="buttons">
				<Help>Change icon for a vector layer.</Help>
			</div>
		</Accordion>

		<Accordion title="Icon color" bind:isExpanded={expanded['icon-color']}>
			<div class="pb-2" slot="content">
				<VectorColorClassification
					{layerId}
					{metadata}
					propertyName="icon-color"
					onlyNumberFields={false}
					bind:numberOfClasses={$numberOfClassesColorStore}
					numberOfClassesMinimum={NumberOfClassesMinimum}
					numberOfClassesMaximum={NumberOfClassesMaximum}
					defaultNumberOfClasses={$page.data.config.NumberOfClasses}
					bind:classificationMethod={$classificationMethodColorStore}
					numberOfRandomSamplingPoints={NumberOfRandomSamplingPoints}
					uniqueValueThreshold={UniqueValueThreshold}
					bind:colorMapName={$colorMapNameStore}
					bind:defaultColor={$defaultColorStore}
				/>
			</div>
			<div slot="buttons">
				<Help>Change icon color by using single color or selected property.</Help>
			</div>
		</Accordion>

		<Accordion title="Icon size" bind:isExpanded={expanded['icon-size']}>
			<div class="pb-2" slot="content">
				<IconSize
					{layerId}
					{metadata}
					bind:defaultIconSize={$page.data.config.IconSize}
					bind:defaultColor={$defaultColorStore}
					bind:numberOfClasses={$numberOfClassesValueStore}
					numberOfClassesMinimum={NumberOfClassesMinimum}
					numberOfClassesMaximum={NumberOfClassesMaximum}
					defaultNumberOfClasses={$page.data.config.NumberOfClasses}
					bind:classificationMethod={$classificationMethodValueStore}
					numberOfRandomSamplingPoints={NumberOfRandomSamplingPoints}
				/>
			</div>
			<div slot="buttons">
				<Help>Change icon color by using single color or selected property.</Help>
			</div>
		</Accordion>

		<Accordion title="Overlap priority" bind:isExpanded={expanded['icon-overlap']}>
			<div class="pb-2" slot="content">
				<IconOverlap {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					Allows for control over whether to show an icon when it overlaps other symbols on the map.
					<br />
					<b>never</b>: The icon will be hidden if it collides with any other previously drawn
					symbol.
					<br />
					<b>always</b>: The icon will be visible even if it collides with any other previously
					drawn symbol.
					<br />
					<b>cooperative</b>: If the icon collides with another previously drawn symbol, the overlap
					mode for that symbol is checked. If the previous symbol was placed using never overlap
					mode, the new icon is hidden. If the previous symbol was placed using always or
					cooperative overlap mode, the new icon is visible.
				</Help>
			</div>
		</Accordion>
	{:else if style.type === 'line'}
		{@const defaultLineWidth = $page.data.config.LineWidth}
		<Accordion title="Line color" bind:isExpanded={expanded['line-color']}>
			<div class="pb-2" slot="content">
				<VectorColorClassification
					{layerId}
					{metadata}
					propertyName="line-color"
					onlyNumberFields={false}
					bind:numberOfClasses={$numberOfClassesColorStore}
					numberOfClassesMinimum={NumberOfClassesMinimum}
					numberOfClassesMaximum={NumberOfClassesMaximum}
					defaultNumberOfClasses={$page.data.config.NumberOfClasses}
					bind:classificationMethod={$classificationMethodColorStore}
					numberOfRandomSamplingPoints={NumberOfRandomSamplingPoints}
					uniqueValueThreshold={UniqueValueThreshold}
					bind:colorMapName={$colorMapNameStore}
					bind:defaultColor={$defaultColorStore}
				/>
			</div>
			<div slot="buttons">
				<Help>The color with which the line will be drawn.</Help>
			</div>
		</Accordion>

		<Accordion title="Line width" bind:isExpanded={expanded['line-width']}>
			<div class="pb-2" slot="content">
				<VectorValueClassification
					{layerId}
					{metadata}
					defaultValue={defaultLineWidth}
					minValue={0}
					maxValue={10}
					stepValue={0.1}
					propertyName={'line-width'}
					styleType="paint"
					legendCssTemplate={`margin-top: 13px; width: 40px; height: {value}px; background-color: ${$defaultColorStore};`}
					dataLabel="Line width"
					bind:numberOfClasses={$numberOfClassesValueStore}
					numberOfClassesMinimum={NumberOfClassesMinimum}
					numberOfClassesMaximum={NumberOfClassesMaximum}
					defaultNumberOfClasses={$page.data.config.NumberOfClasses}
					bind:classificationMethod={$classificationMethodValueStore}
					numberOfRandomSamplingPoints={NumberOfRandomSamplingPoints}
				/>
			</div>
			<div slot="buttons">
				<Help>Stroke thickness.</Help>
			</div>
		</Accordion>

		<Accordion title="Line pattern" bind:isExpanded={expanded['line-pattern']}>
			<div class="pb-2" slot="content">
				<LinePattern {layerId} />
			</div>
			<div slot="buttons">
				<Help>Line pattern for drawing.</Help>
			</div>
		</Accordion>
	{:else if style.type === 'circle'}
		<Accordion title="Circle radius" bind:isExpanded={expanded['circle-radius']}>
			<div class="pb-2" slot="content">
				<CircleRadius {layerId} />
			</div>
			<div slot="buttons">
				<Help>Apply circle radius to the vector layer.</Help>
			</div>
		</Accordion>

		<Accordion title="Circle color" bind:isExpanded={expanded['circle-color']}>
			<div class="pb-2" slot="content">
				<VectorColorClassification
					{layerId}
					{metadata}
					propertyName="circle-color"
					bind:numberOfClasses={$numberOfClassesColorStore}
					numberOfClassesMinimum={NumberOfClassesMinimum}
					numberOfClassesMaximum={NumberOfClassesMaximum}
					defaultNumberOfClasses={$page.data.config.NumberOfClasses}
					bind:classificationMethod={$classificationMethodColorStore}
					numberOfRandomSamplingPoints={NumberOfRandomSamplingPoints}
					uniqueValueThreshold={UniqueValueThreshold}
					bind:colorMapName={$colorMapNameStore}
					bind:defaultColor={$defaultColorStore}
				/>
			</div>
			<div slot="buttons">
				<Help>Change circle color by using single color or selected property</Help>
			</div>
		</Accordion>

		<Accordion title="Circle stroke color" bind:isExpanded={expanded['circle-stroke-color']}>
			<div class="pb-2" slot="content">
				<CircleStrokeColor {layerId} />
			</div>
			<div slot="buttons">
				<Help>The stroke color of the circle.</Help>
			</div>
		</Accordion>

		<Accordion title="Circle stroke width" bind:isExpanded={expanded['circle-stroke-width']}>
			<div class="pb-2" slot="content">
				<CircleStrokeWidth {layerId} />
			</div>
			<div slot="buttons">
				<Help
					>The width of the circle's stroke. Strokes are placed outside of the circle radius.</Help
				>
			</div>
		</Accordion>
	{:else if style.type === 'fill'}
		<Accordion title="Fill color" bind:isExpanded={expanded['fill-color']}>
			<div class="pb-2" slot="content">
				<VectorColorClassification
					{layerId}
					{metadata}
					propertyName="fill-color"
					bind:numberOfClasses={$numberOfClassesColorStore}
					numberOfClassesMinimum={NumberOfClassesMinimum}
					numberOfClassesMaximum={NumberOfClassesMaximum}
					defaultNumberOfClasses={$page.data.config.NumberOfClasses}
					bind:classificationMethod={$classificationMethodColorStore}
					numberOfRandomSamplingPoints={NumberOfRandomSamplingPoints}
					uniqueValueThreshold={UniqueValueThreshold}
					bind:colorMapName={$colorMapNameStore}
					bind:defaultColor={$defaultColorStore}
				/>
			</div>
			<div slot="buttons">
				<Help>Change polygon fill color by using single color or selected property.</Help>
			</div>
		</Accordion>

		<Accordion title="Fill outline color" bind:isExpanded={expanded['fill-outline-color']}>
			<div class="pb-2" slot="content">
				<FillOutlineColor {layerId} />
			</div>
			<div slot="buttons">
				<Help>Change polygon outline color.</Help>
			</div>
		</Accordion>
	{:else if style.type === 'fill-extrusion'}
		<Accordion title="3D polygon color" bind:isExpanded={expanded['fill-extrusion-color']}>
			<div class="pb-2" slot="content">
				<VectorColorClassification
					{layerId}
					{metadata}
					propertyName="fill-extrusion-color"
					bind:numberOfClasses={$numberOfClassesColorStore}
					numberOfClassesMinimum={NumberOfClassesMinimum}
					numberOfClassesMaximum={NumberOfClassesMaximum}
					defaultNumberOfClasses={$page.data.config.NumberOfClasses}
					bind:classificationMethod={$classificationMethodColorStore}
					numberOfRandomSamplingPoints={NumberOfRandomSamplingPoints}
					uniqueValueThreshold={UniqueValueThreshold}
					bind:colorMapName={$colorMapNameStore}
					bind:defaultColor={$defaultColorStore}
				/>
			</div>
			<div slot="buttons">
				<Help>Change 3D polygon fill color by using single color or selected property.</Help>
			</div>
		</Accordion>

		<Accordion title="Height of 3D polygon" bind:isExpanded={expanded['fill-extrusion-height']}>
			<div class="pb-2" slot="content">
				<FillExtrusionHeight {layerId} {metadata} />
			</div>
			<div slot="buttons">
				<Help>The height with which to extrude this layer.</Help>
			</div>
		</Accordion>

		<Accordion title="Base height" bind:isExpanded={expanded['fill-extrusion-base']}>
			<div class="pb-2" slot="content">
				<FillExtrusionBase {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					The height with which to extrude the base of this layer. Must be less than or equal to the
					height
				</Help>
			</div>
		</Accordion>

		<Accordion
			title="Vertical gradient to the sides"
			bind:isExpanded={expanded['fill-extrusion-vertical-gradient']}
		>
			<div class="pb-2" slot="content">
				<FillExtrusionVerticalGradient {layerId} />
			</div>
			<div slot="buttons">
				<Help>
					Whether to apply a vertical gradient to the sides of a 3D polygon layer. If true, sides
					will be shaded slightly darker farther down.
				</Help>
			</div>
		</Accordion>
	{/if}
</div>
