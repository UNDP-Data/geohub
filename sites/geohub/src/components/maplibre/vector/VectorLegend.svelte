<script lang="ts">
	import LegendTypeSwitcher from '$components/maplibre/LegendTypeSwitcher.svelte';
	import VectorPolygon from '$components/maplibre/fill/VectorPolygon.svelte';
	import VectorHeatmap from '$components/maplibre/heatmap/VectorHeatmap.svelte';
	import VectorLine from '$components/maplibre/line/VectorLine.svelte';
	import VectorSymbol from '$components/maplibre/symbol/VectorSymbol.svelte';
	import VectorClassifyLegend from '$components/maplibre/vector/VectorClassifyLegend.svelte';
	import Help from '$components/util/Help.svelte';
	import { LegendTypes } from '$lib/config/AppConfig';
	import { getVectorDefaultColor, isVectorIntervalExpression, loadMap } from '$lib/helper';
	import type { VectorTileMetadata } from '$lib/types';
	import {
		APPLY_TO_OPTION_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		createApplyToOptionStoreStore,
		type MapStore
	} from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import VectorCircle from '../circle/VectorCircle.svelte';
	import VectorFillExtrusion from '../fill-extrusion/VectorFillExtrusion.svelte';
	import VectorPropertyEditor from './VectorPropertyEditor.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const applyToOptionStore = createApplyToOptionStoreStore();
	setContext(APPLY_TO_OPTION_CONTEXT_KEY, applyToOptionStore);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	const defaultColor = writable<string>('');
	const defaultLineColor = writable<string>('');

	let legendType: LegendTypes;

	const style: LayerSpecification = $map
		.getStyle()
		.layers.filter((l: LayerSpecification) => l.id === layerId)[0];

	if (style?.type === 'line') {
		if (
			isVectorIntervalExpression($map, layerId, 'line-color') ||
			isVectorIntervalExpression($map, layerId, 'line-width')
		) {
			legendType = LegendTypes.CLASSIFY;
		}
	} else if (style?.type === 'symbol') {
		if (
			isVectorIntervalExpression($map, layerId, 'icon-color') ||
			isVectorIntervalExpression($map, layerId, 'icon-size')
		) {
			legendType = LegendTypes.CLASSIFY;
		}
	} else if (style?.type === 'fill') {
		if (isVectorIntervalExpression($map, layerId, 'fill-color')) {
			legendType = LegendTypes.CLASSIFY;
		}
	}

	$defaultColor =
		style?.type === 'symbol'
			? getVectorDefaultColor($map, layerId, 'icon-color')
			: style?.type === 'fill'
			? getVectorDefaultColor($map, layerId, 'fill-color')
			: style?.type === 'line'
			? getVectorDefaultColor($map, layerId, 'line-color')
			: undefined;

	$defaultLineColor =
		style?.type === 'line'
			? getVectorDefaultColor($map, layerId, 'line-color', $defaultColor)
			: style?.type === 'fill'
			? getVectorDefaultColor($map, layerId, 'fill-outline-color', $defaultColor)
			: undefined;

	// set default values
	legendType = legendType ? legendType : LegendTypes.DEFAULT;

	const vectorLayerLoaded = async () => {
		return await loadMap($map);
	};

	$: legendType, handleLegendTypeChanged();
	const handleLegendTypeChanged = () => {
		if (legendType === LegendTypes.DEFAULT) {
			$applyToOptionStore = undefined;
		}
	};
</script>

<div class="legend-container">
	{#if !['heatmap', 'circle', 'fill-extrusion'].includes(style.type)}
		<LegendTypeSwitcher bind:legendType />
		<div class="help">
			<Help>
				<div>
					<p>Enhance your visualizations using the following tips!</p>
					<p>
						The <b>Default</b> legend will showcase the dataset based on its geometry (Point, Polygon,
						Line or Heatmap) and you may change colors and size to your liking.
					</p>
					<p>
						The <b>Classify</b> legend allows more functionality with the ability to interchange between
						classification types (interval or unique value legend), colors, and the number of classes.
					</p>
					<p>
						Color of each class can be changed by clicking the <b>colored box</b> or hidden using
						the <b>eye</b> button left of the box
					</p>
				</div>
			</Help>
		</div>
	{/if}
	<div class="editor-button">
		<VectorPropertyEditor
			bind:layerId
			bind:legendType
			bind:defaultColor={$defaultColor}
			bind:metadata
		/>
	</div>
	{#await vectorLayerLoaded()}
		<div class="loader-container p-3">
			<Loader size="small" />
		</div>
	{:then}
		{#if style.type === 'heatmap'}
			<VectorHeatmap {layerId} />
		{:else if style.type === 'circle'}
			<VectorCircle {layerId} />
		{:else if style.type === 'fill-extrusion'}
			<VectorFillExtrusion {layerId} bind:defaultFillColor={$defaultColor} />
		{:else if legendType === LegendTypes.DEFAULT}
			<div transition:slide|global>
				{#if style.type === 'line'}
					<VectorLine {layerId} bind:defaultColor={$defaultLineColor} />
				{:else if style.type === 'fill'}
					<VectorPolygon
						{layerId}
						bind:defaultFillColor={$defaultColor}
						bind:defaultFillOutlineColor={$defaultLineColor}
					/>
				{:else if style.type === 'symbol'}
					<VectorSymbol {layerId} bind:defaultColor={$defaultColor} />
				{/if}
			</div>
		{:else if legendType === LegendTypes.CLASSIFY}
			<div transition:slide|global>
				<VectorClassifyLegend {layerId} bind:metadata bind:defaultColor={$defaultColor} />
			</div>
		{/if}
	{/await}
</div>

<style lang="scss">
	.loader-container {
		display: flex;
		align-items: center;
		width: fit-content;
		margin: 0 auto;
	}

	.legend-container {
		position: relative;

		.help {
			position: absolute;
			top: 0em;
			left: 0em;
		}

		.editor-button {
			position: absolute;
			top: 0em;
			right: 0em;
			z-index: 10;
		}
	}
</style>
