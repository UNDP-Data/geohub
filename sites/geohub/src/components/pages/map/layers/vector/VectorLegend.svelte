<script lang="ts">
	import LegendTypeSwitcher from '$components/pages/map/layers/LegendTypeSwitcher.svelte';
	import VectorClassifyLegend from '$components/pages/map/layers/vector/VectorClassifyLegend.svelte';
	import VectorHeatmap from '$components/pages/map/layers/vector/VectorHeatmap.svelte';
	import VectorLine from '$components/pages/map/layers/vector/VectorLine.svelte';
	import VectorPolygon from '$components/pages/map/layers/vector/VectorPolygon.svelte';
	import VectorSymbol from '$components/pages/map/layers/vector/VectorSymbol.svelte';
	import Help from '$components/util/Help.svelte';
	import { LegendTypes, VectorApplyToTypes } from '$lib/config/AppConfig';
	import { loadMap } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;
	export let applyToOption: VectorApplyToTypes;
	export let legendType: LegendTypes;

	const layerId = layer.id;
	const style: LayerSpecification = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	const isIntervalExpression = (
		property: 'line-color' | 'line-width' | 'icon-color' | 'icon-size' | 'fill-color'
	) => {
		const layoutProperties = ['icon-size'];
		const expr = layoutProperties.includes(property)
			? $map.getLayoutProperty(layer.id, property)
			: $map.getPaintProperty(layer.id, property);
		return expr?.type === 'interval' || expr?.type === 'categorical';
	};

	if (style.type === 'line') {
		if (isIntervalExpression('line-color')) {
			legendType = LegendTypes.CLASSIFY;
			applyToOption = VectorApplyToTypes.COLOR;
		} else if (isIntervalExpression('line-width')) {
			legendType = LegendTypes.CLASSIFY;
			applyToOption = VectorApplyToTypes.SIZE;
		}
	} else if (style.type === 'symbol') {
		if (isIntervalExpression('icon-color')) {
			legendType = LegendTypes.CLASSIFY;
			applyToOption = VectorApplyToTypes.COLOR;
		} else if (isIntervalExpression('icon-size')) {
			legendType = LegendTypes.CLASSIFY;
			applyToOption = VectorApplyToTypes.SIZE;
		}
	} else if (style.type === 'fill') {
		if (isIntervalExpression('fill-color')) {
			legendType = LegendTypes.CLASSIFY;
		}
	}

	const getDefaultColor = (
		property: 'icon-color' | 'fill-color' | 'fill-outline-color' | 'line-color'
	): string => {
		let color = $map.getPaintProperty(layer.id, property);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (
			!color ||
			(color && (color.type === 'interval' || (color && color.type === 'categorical')))
		) {
			if (property === 'fill-outline-color') {
				color = chroma(defaultColor).darken(2.5).hex();
			} else {
				color = chroma.random().hex();
			}
		}
		return color as string;
	};

	export let defaultColor: string =
		style.type === 'symbol'
			? getDefaultColor('icon-color')
			: style.type === 'fill'
			? getDefaultColor('fill-color')
			: style.type === 'line'
			? getDefaultColor('line-color')
			: undefined;

	export let defaultLineColor: string =
		style.type === 'line'
			? getDefaultColor('line-color')
			: style.type === 'fill'
			? getDefaultColor('fill-outline-color')
			: undefined;

	// set default values
	legendType = legendType ? legendType : LegendTypes.DEFAULT;

	const vectorLayerLoaded = async () => {
		return await loadMap($map);
	};
</script>

<div class="legend-container">
	{#if style.type !== 'heatmap'}
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
	{#await vectorLayerLoaded()}
		<div class="loader-container p-3">
			<Loader size="small" />
		</div>
	{:then}
		{#if style.type === 'heatmap'}
			<VectorHeatmap {layerId} />
		{:else if legendType === LegendTypes.DEFAULT}
			<div transition:slide|global>
				{#if style.type === 'line'}
					<VectorLine {layerId} bind:defaultColor={defaultLineColor} />
				{:else if style.type === 'fill'}
					<VectorPolygon
						{layerId}
						bind:defaultFillColor={defaultColor}
						bind:defaultFillOutlineColor={defaultLineColor}
					/>
				{:else if style.type === 'symbol'}
					<VectorSymbol {layerId} bind:defaultColor />
				{/if}
			</div>
		{:else if legendType === LegendTypes.CLASSIFY}
			<div transition:slide|global>
				<VectorClassifyLegend bind:layer bind:defaultColor bind:applyToOption />
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
	}
</style>
