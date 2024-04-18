<script lang="ts">
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';

	const dispatch = createEventDispatcher();

	export let min: number;
	export let max: number;
	export let step = 1;
	export let values: number[];
	export let rest = true;
	export let disabled = false;
	export let floatLabel = true;
	export let first: 'pip' | 'label' | false = 'label';
	export let last: 'pip' | 'label' | false = 'label';

	const setSliderValue = debounce((e: { detail: { values: number[] } }) => {
		values = e.detail.values;
		dispatch('change', {
			values: values
		});
	}, 300);
</script>

<div class=" range-slider m-auto">
	<RangeSlider
		bind:min
		bind:max
		bind:step
		bind:float={floatLabel}
		range={values.length > 1 ? true : false}
		pips
		{first}
		{last}
		bind:rest
		bind:values
		on:stop={setSliderValue}
		bind:disabled
	/>
</div>

<style lang="scss">
	.range-slider {
		--range-handle-focus: #2196f3;
		--range-handle-inactive: #2196f3;
		--range-handle: #2196f3;
		--range-range-inactive: #2196f3;
		margin: 0;
		font-size: 12px;
	}
</style>
