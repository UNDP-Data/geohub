<script lang="ts">
	import { debounce } from 'lodash-es';
	import RangeSlider from 'svelte-range-slider-pips';
	import NumberInput from './NumberInput.svelte';

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
		onchange?: (values: number[]) => void;
	}

	let {
		min = $bindable(),
		max = $bindable(),
		step = $bindable(1),
		values = $bindable(),
		rest = true,
		disabled = $bindable(false),
		floatLabel = true,
		pips = true,
		pipstep = $bindable(1),
		all = false,
		first = 'label',
		last = 'label',
		prefix = '',
		suffix = '',
		range = values.length > 1 ? true : false,
		showEditor = false,
		formatter = (value: number) => {
			return value;
		},
		onchange = () => {}
	}: Props = $props();

	const setSliderValue = debounce((e: { detail: { values: number[] } }) => {
		values = e.detail.values;
		if (onchange) onchange(values);
	}, 300);

	const handleNumberChanged = debounce(() => {
		if (onchange) onchange(values);
	}, 300);
</script>

<div class="range-slider">
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

	{#if values && showEditor}
		{#if values.length === 1}
			<div class="is-flex is-justify-content-center inputs">
				<NumberInput
					minValue={min}
					maxValue={max}
					{step}
					value={values[0]}
					size="small"
					onchange={(value: number) => {
						values[0] = value;
						handleNumberChanged();
					}}
				/>
			</div>
		{:else if values.length === 2}
			<div class="is-flex is-justify-content-space-evenly inputs">
				<NumberInput
					minValue={min}
					maxValue={values[1]}
					bind:step
					value={values[0]}
					size="small"
					onchange={(value: number) => {
						values[0] = value;
						handleNumberChanged();
					}}
				/>
				<NumberInput
					minValue={values[0]}
					maxValue={max}
					{step}
					value={values[1]}
					size="small"
					onchange={(value: number) => {
						values[1] = value;
						handleNumberChanged();
					}}
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
