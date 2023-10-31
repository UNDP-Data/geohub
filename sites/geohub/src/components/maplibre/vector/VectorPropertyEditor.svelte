<script lang="ts">
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import OptionalPropertyEditor from '$components/maplibre/OptionalPropertyEditor.svelte';
	import HeatmapIntensity from '$components/maplibre/heatmap/HeatmapIntensity.svelte';
	import HeatmapRadius from '$components/maplibre/heatmap/HeatmapRadius.svelte';
	import HeatmapWeight from '$components/maplibre/heatmap/HeatmapWeight.svelte';
	import LineColor from '$components/maplibre/line/LineColor.svelte';
	import LinePattern from '$components/maplibre/line/LinePattern.svelte';
	import LineWidth from '$components/maplibre/line/LineWidth.svelte';
	import IconColor from '$components/maplibre/symbol/IconColor.svelte';
	import IconImage from '$components/maplibre/symbol/IconImage.svelte';
	import IconOverlap from '$components/maplibre/symbol/IconOverlap.svelte';
	import IconSize from '$components/maplibre/symbol/IconSize.svelte';
	import { LegendTypes, VectorApplyToTypes } from '$lib/config/AppConfig';
	import type { VectorLayerSpecification } from '$lib/types';
	import {
		APPLY_TO_OPTION_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type ApplyToOptionStore,
		type MapStore
	} from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const applyToOptionStore: ApplyToOptionStore = getContext(APPLY_TO_OPTION_CONTEXT_KEY);

	export let layerId: string;
	export let legendType: LegendTypes;
	export let defaultColor: string;

	const style: VectorLayerSpecification = $map
		.getStyle()
		.layers.find((l: LayerSpecification) => l.id === layerId) as VectorLayerSpecification;
</script>

<OptionalPropertyEditor {layerId}>
	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label is-normal">Opacity </label>
		<div class="control">
			<OpacitySlider bind:layerId />
		</div>
	</div>

	{#if style.type === 'symbol'}
		{#if legendType === LegendTypes.CLASSIFY}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Icon image</label>
				<div class="control">
					<IconImage {layerId} bind:defaultColor />
				</div>
			</div>
			{#if $applyToOptionStore === VectorApplyToTypes.SIZE}
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Icon color</label>
					<div class="control">
						<IconColor {layerId} bind:defaultColor />
					</div>
				</div>
			{/if}
		{/if}

		{#if legendType === LegendTypes.DEFAULT || $applyToOptionStore === VectorApplyToTypes.COLOR}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Icon size</label>
				<div class="control">
					<IconSize {layerId} />
				</div>
			</div>
		{/if}

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Overlap Priority</label>
			<div class="control">
				<IconOverlap {layerId} />
			</div>
		</div>
	{:else if style.type === 'line'}
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Line Pattern</label>
			<div class="control">
				<LinePattern {layerId} bind:defaultColor />
			</div>
		</div>

		{#if $applyToOptionStore === VectorApplyToTypes.SIZE}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Line color</label>
				<div class="control pl-2">
					<LineColor {layerId} bind:defaultColor />
				</div>
			</div>
		{/if}
		{#if $applyToOptionStore === VectorApplyToTypes.COLOR}
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Line width</label>
				<div class="control">
					<LineWidth {layerId} />
				</div>
			</div>
		{/if}
	{:else if style.type === 'heatmap'}
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Heatmap Intensity</label>
			<div class="control">
				<HeatmapIntensity {layerId} />
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Heatmap Radius</label>
			<div class="control">
				<HeatmapRadius {layerId} />
			</div>
		</div>

		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Heatmap Weight</label>
			<div class="control">
				<HeatmapWeight {layerId} />
			</div>
		</div>
	{/if}
</OptionalPropertyEditor>
