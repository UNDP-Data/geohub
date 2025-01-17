<script lang="ts">
	import {
		SegmentButtons,
		type SegmentButton,
		type VectorLayerTileStatLayer
	} from '@undp-data/svelte-undp-components';
	import { untrack } from 'svelte';

	interface Props {
		layer: VectorLayerTileStatLayer;
		layerType: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle';
		size?: 'small' | 'normal' | 'medium' | 'large';
		onchange?: (type: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle') => void;
	}

	let {
		layer = $bindable(),
		layerType = $bindable(),
		size = $bindable('normal'),
		onchange = () => {}
	}: Props = $props();

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

	let symbolVectorType: 'point' | 'heatmap' = $state('point');

	let symbolVectorTypes: SegmentButton[] = $state([
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
	]);

	let polygonVectorType: 'polygon' | 'linestring' = $state('polygon');
	let polygonVectorTypes: SegmentButton[] = $state([
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
	]);

	const setLayerType = () => {
		if (!layer) return;
		if (['point', 'multipoint'].includes(layer.geometry.toLowerCase())) {
			layerType = symbolVectorType;
		} else if (['polygon', 'multipolygon'].includes(layer.geometry.toLowerCase())) {
			layerType = polygonVectorType;
		}
		if (onchange) onchange(layerType);
	};
	$effect(() => {
		if (layer) {
			untrack(() => {
				setDefaultLayerType();
			});
		}
	});
</script>

{#if layer.geometry.toLowerCase().indexOf('line') === -1}
	<p class="subtitle is-6 m-0 p-0 pb-1">Select layer type before adding layer.</p>

	{#if layer.geometry.toLowerCase().indexOf('point') > -1}
		<SegmentButtons
			bind:buttons={symbolVectorTypes}
			bind:selected={symbolVectorType}
			{size}
			on:change={setLayerType}
		/>
	{:else}
		<SegmentButtons
			bind:buttons={polygonVectorTypes}
			bind:selected={polygonVectorType}
			{size}
			on:change={setLayerType}
		/>
	{/if}
{/if}
