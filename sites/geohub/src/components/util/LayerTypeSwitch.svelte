<script lang="ts">
	import type { VectorLayerTileStatLayer } from '$lib/types';
	import { Radios, type Radio } from '@undp-data/svelte-undp-design';

	export let layer: VectorLayerTileStatLayer;
	export let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring';

	$: layer, setDefaultLayerType();
	const setDefaultLayerType = () => {
		if (!layer) return;
		if (['linestring', 'multilinestring'].includes(layer.geometry.toLowerCase())) {
			layerType = 'linestring';
		} else if (['polygon', 'multipolygon'].includes(layer.geometry.toLowerCase())) {
			layerType = 'polygon';
		} else {
			layerType = 'point';
		}
	};

	let symbolVectorType: 'point' | 'heatmap' = 'point';

	let symbolVectorTypes: Radio[] = [
		{
			label: 'Point',
			value: 'point'
		},
		{
			label: 'Heatmap',
			value: 'heatmap'
		}
	];

	let polygonVectorType: 'polygon' | 'linestring' = 'polygon';
	let polygonVectorTypes: Radio[] = [
		{
			label: 'Polygon',
			value: 'polygon'
		},
		{
			label: 'Line',
			value: 'linestring'
		}
	];

	$: symbolVectorType, setLayerType();
	$: polygonVectorType, setLayerType();
	const setLayerType = () => {
		if (!layer) return;
		if (['point', 'multipoint'].includes(layer.geometry.toLowerCase())) {
			layerType = symbolVectorType;
		} else if (['polygon', 'multipolygon'].includes(layer.geometry.toLowerCase())) {
			layerType = polygonVectorType;
		}
	};
</script>

{#if ['point', 'multipoint'].includes(layer.geometry.toLocaleLowerCase())}
	<p class="subtitle is-6 m-0 p-0 pb-1">Select layer type before adding layer.</p>

	<div class="vector-symbol-radios pb-2">
		<Radios
			bind:radios={symbolVectorTypes}
			bind:value={symbolVectorType}
			groupName="vector-symbol-type-{layer.layer}"
			isVertical={false}
		/>
	</div>
{:else if ['polygon', 'multipolygon'].includes(layer.geometry.toLocaleLowerCase())}
	<p class="subtitle is-6 m-0 p-0 pb-1">Select layer type before adding layer.</p>

	<div class="vector-polygon-radios pb-2">
		<Radios
			bind:radios={polygonVectorTypes}
			bind:value={polygonVectorType}
			groupName="vector-polygon-type-{layer.layer}"
			isVertical={false}
		/>
	</div>
{/if}
