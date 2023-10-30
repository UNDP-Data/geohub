<script lang="ts">
	import { page } from '$app/stores';
	import NumberInput from '$components/util/NumberInput.svelte';
	import { getLineWidth } from '$lib/helper';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	let defaultLineWidth = $page.data.config.LineWidth;
	let maxValue = 10;
	let minValue = 0;
	let propertyName = 'line-width';
	let stepValue = 0.1;

	const getValue = () => {
		let value = getLineWidth($map, layerId, defaultLineWidth);
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
