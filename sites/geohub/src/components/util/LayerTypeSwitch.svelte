<script lang="ts">
	import type { VectorLayerTileStatLayer } from '$lib/types';
	import type { Radio } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let layer: VectorLayerTileStatLayer;
	export let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle';

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
		},
		{
			label: 'Circle',
			value: 'circle'
		}
	];

	let polygonVectorType: 'polygon' | 'linestring' = 'polygon';
	let polygonVectorTypes: Radio[] = [
		{
			label: 'Polygon',
			value: 'polygon'
		},
		{
			label: '3D Polygon',
			value: 'fill-extrusion'
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
		dispatch('change', {
			type: layerType
		});
	};
</script>

{#if layer.geometry.toLowerCase().indexOf('line') === -1}
	<p class="subtitle is-6 m-0 p-0 pb-1">Select layer type before adding layer.</p>

	<div class="select is-link is-fullwidth mb-2">
		{#if layer.geometry.toLowerCase().indexOf('point') > -1}
			<select bind:value={symbolVectorType}>
				{#each symbolVectorTypes as type}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		{:else}
			<select bind:value={polygonVectorType}>
				{#each polygonVectorTypes as type}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		{/if}
	</div>
{/if}
