<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Layer } from '$lib/types';
	import { map } from '$stores';
	import { getLineWidth } from '$lib/helper';
	import NumberInput from '../NumberInput.svelte';

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
