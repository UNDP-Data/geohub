<script lang="ts">
	import { page } from '$app/stores';
	import VectorValueClassification from '$components/maplibre/vector/VectorValueClassification.svelte';
	import type { VectorTileMetadata } from '$lib/types';
	import { DEFAULTCOLOR_CONTEXT_KEY, type DefaultColorStore } from '$stores';
	import { getContext } from 'svelte';

	const defaultColorStore: DefaultColorStore = getContext(DEFAULTCOLOR_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;

	let defaultLineWidth = $page.data.config.LineWidth;
	let maxValue = 10;
	let minValue = 0;
	let propertyName = 'line-width';
	let stepValue = 0.1;
</script>

<VectorValueClassification
	{layerId}
	{metadata}
	bind:defaultValue={defaultLineWidth}
	{minValue}
	{maxValue}
	{stepValue}
	{propertyName}
	styleType="paint"
	legendCssTemplate={`margin-top: 5px; width: 40px; height: {value}px; background-color: ${$defaultColorStore};`}
	dataLabel="Line width"
/>
