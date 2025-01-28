<script lang="ts">
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';
	import NumberInput from './NumberInput.svelte';

	const dispatch = createEventDispatcher();

	interface Props {
		min: number;
		max: number;
		step?: number;
		values: number[];
		rest?: boolean | 'pip' | 'label';
		disabled?: boolean;
		floatLabel?: boolean;
		pips?: boolean;
		pipstep?: number;
		all?: boolean | 'pip' | 'label';
		first?: 'pip' | 'label' | false;
		last?: 'pip' | 'label' | false;
		prefix?: string;
		suffix?: string;
		range?: boolean | 'min' | 'max';
		showEditor?: boolean;
		formatter?: (value: number, index: number, percent: number) => number | string;
	}

	let {
		min = $bindable(),
		max = $bindable(),
		step = $bindable(1),
		values = $bindable(),
		rest = $bindable(true),
		disabled = $bindable(false),
		floatLabel = $bindable(true),
		pips = $bindable(true),
		pipstep = $bindable(1),
		all = $bindable(false),
		first = $bindable('label'),
		last = $bindable('label'),
		prefix = $bindable(''),
		suffix = $bindable(''),
		range = $bindable(values.length > 1 ? true : false),
		showEditor = $bindable(false),
		formatter = (value: number) => {
			return value;
		}
	}: Props = $props();

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
		bind:pipstep
		bind:all
		{first}
		{last}
		bind:rest
		bind:values
		on:stop={setSliderValue}
		bind:disabled
		bind:prefix
		bind:suffix
		{formatter}
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
		--range-handle-focus: #6babeb;
		--range-handle-inactive: #6babeb;
		--range-handle: #6babeb;
		--range-range-inactive: #6babeb;
		margin: 0;
		font-size: 12px;
	}

	.inputs {
		height: 30px;
	}
</style>
