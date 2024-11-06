<script lang="ts">
	import {
		SegmentButtons,
		type SegmentButton,
		type VectorLayerTileStatLayer
	} from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let layer: VectorLayerTileStatLayer;
	export let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle';
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'normal';

	$: layer, setDefaultLayerType();
	const setDefaultLayerType = () => {
		if (!layer) return;
		if (['linestring', 'multilinestring'].includes(layer.geometry.toLowerCase())) {
			layerType = 'linestring';
		} else if (['polygon', 'multipolygon'].includes(layer.geometry.toLowerCase())) {
			layerType = 'polygon';
			polygonVectorType = layerType;
		} else {
			layerType = 'point';
			symbolVectorType = layerType;
		}
	};

	let symbolVectorType: 'point' | 'heatmap' = 'point';

	let symbolVectorTypes: SegmentButton[] = [
		{
			title: 'Point',
			value: 'point'
		},
		{
			title: 'Heatmap',
			value: 'heatmap'
		},
		{
			title: 'Circle',
			value: 'circle'
		}
	];

	let polygonVectorType: 'polygon' | 'linestring' = 'polygon';
	let polygonVectorTypes: SegmentButton[] = [
		{
			title: 'Polygon',
			value: 'polygon'
		},
		{
			title: '3D Polygon',
			value: 'fill-extrusion'
		},
		{
			title: 'Line',
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

	{#if layer.geometry.toLowerCase().indexOf('point') > -1}
		<SegmentButtons bind:buttons={symbolVectorTypes} bind:selected={symbolVectorType} {size} />
	{:else}
		<SegmentButtons bind:buttons={polygonVectorTypes} bind:selected={polygonVectorType} {size} />
	{/if}
{/if}
