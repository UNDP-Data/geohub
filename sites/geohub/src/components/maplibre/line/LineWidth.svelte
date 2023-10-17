<script lang="ts">
	import { page } from '$app/stores';
	import { getLineWidth } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { getContext, onMount } from 'svelte';
	import NumberInput from '$components/util/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const layerId = layer.id;

	let defaultLineWidth = $page.data.config.LineWidth;
	let maxValue = 10;
	let minValue = 0;
	let propertyName = 'line-width';
	let stepValue = 0.1;

	const getValue = () => {
		let value = getLineWidth($map, layer.id, defaultLineWidth);
		return value;
	};

	let value = getValue();

	onMount(() => {
		setValue();
	});

	const setValue = () => {
		map.setPaintProperty(layerId, propertyName, value);
	};
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
