<script lang="ts">
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';
	import NumberInput from './NumberInput.svelte';

	const dispatch = createEventDispatcher();

	export let min: number;
	export let max: number;
	export let step = 1;
	export let values: number[];
	export let rest = true;
	export let disabled = false;
	export let floatLabel = true;
	export let pips = true;
	export let first: 'pip' | 'label' | false = 'label';
	export let last: 'pip' | 'label' | false = 'label';
	export let prefix = '';
	export let suffix = '';
	export let range: boolean | 'min' | 'max' = values.length > 1 ? true : false;
	export let showEditor = false;

	const setSliderValue = debounce((e: { detail: { values: number[] } }) => {
		values = e.detail.values;
		dispatch('change', {
			values: values
		});
	}, 300);

	const handleNumberChanged = debounce(() => {
		dispatch('change', {
			values: values
		});
	}, 300);
</script>

<div class=" range-slider">
	<RangeSlider
		bind:min
		bind:max
		bind:step
		bind:float={floatLabel}
		bind:range
		bind:pips
		{first}
		{last}
		bind:rest
		bind:values
		on:stop={setSliderValue}
		bind:disabled
		bind:prefix
		bind:suffix
	/>

	{#if showEditor}
		{#if values.length === 1}
			<div class="is-flex is-justify-content-center inputs">
				<NumberInput
					bind:minValue={min}
					bind:maxValue={max}
					bind:step
					bind:value={values[0]}
					size="small"
					on:change={handleNumberChanged}
				/>
			</div>
		{:else if values.length === 2}
			<div class="is-flex is-justify-content-space-evenly inputs">
				<NumberInput
					bind:minValue={min}
					bind:maxValue={values[1]}
					bind:step
					bind:value={values[0]}
					size="small"
					on:change={handleNumberChanged}
				/>
				<NumberInput
					bind:minValue={values[0]}
					bind:maxValue={max}
					bind:step
					bind:value={values[1]}
					size="small"
					on:change={handleNumberChanged}
				/>
			</div>
		{/if}
	{/if}
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

	.inputs {
		height: 30px;
	}
</style>
