<script context="module" lang="ts">
	type ValueType = number | boolean | string;
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import NumberInput from './NumberInput.svelte';
	import Slider from './Slider.svelte';

	const dispatch = createEventDispatcher();

	/**
	 * Property ID
	 */
	export let id: string;

	/**
	 * Type of editor.
	 * integer: show NumberInput element or slider. Slider is only shown if both (exclusive)minimum and (exclusive)maximum are set
	 * number: show NumberInput element or slider. Slider is only shown if both (exclusive)minimum and (exclusive)maximum are set
	 * string: show textbox
	 * boolean: show toggle switch control
	 */
	export let type: 'integer' | 'number' | 'boolean' | 'string';

	/**
	 * Title of property
	 */
	export let title: string;

	/**
	 * Optional Description of property
	 */
	export let description: string = '';

	/**
	 * Optional. Fontawesome Icon class name. eg, 'fas fa-user fa-lg'
	 */
	export let icon = '';

	/**
	 * Value
	 */
	export let value: ValueType;

	/**
	 * Default value
	 */
	export let defaultValue: ValueType;

	/**
	 * Optional. Exclusive maximum value. n < exclusiveMaximum
	 * it is only used when 'type' is either integer or number
	 */
	export let exclusiveMaximum: number | undefined = undefined;

	/**
	 * Optional. maximum value. n < maximum
	 * if exclusiveMaximum is used, maximum will not be used.
	 * it is only used when 'type' is either integer or number.
	 */
	export let maximum: number | undefined = undefined;

	/**
	 * Optional. Exclusive minimum value. n < exclusiveMinimum
	 * it is only used when 'type' is either integer or number.
	 */
	export let exclusiveMinimum: number | undefined = undefined;

	/**
	 * Optional. minimum value. n < minimum
	 * if exclusiveMinimum is used, minimum will not be used.
	 * it is only used when 'type' is either integer or number.
	 */
	export let minimum: number | undefined = undefined;

	/**
	 * Optional. If true, show +/- prefix in tag. Only available for numeric data type.
	 */
	export let showPrefix = false;

	/**
	 * Optional. Unit name. It will be shown in tag if specified.
	 */
	export let unit = '';

	/**
	 * The state of either expanded or collapsed.
	 */
	export let isExpanded = false;

	/**
	 * If enabled, show manual text editor (only available when slider is used)
	 */
	export let showEditor = false;

	const DEFAULT_MINIMUM = -9999;
	const DEFAULT_MAXIMUM = 9999;

	let isHovered = false;
	$: isActive = defaultValue !== value;

	const handleClear = () => {
		value = defaultValue;
		dispatch('change', {
			id: id,
			value: value
		});
	};

	const handleChanged = () => {
		dispatch('change', {
			id: id,
			value: value
		});
	};

	const setSliderValue = debounce((e: { detail: { values: number[] } }) => {
		value = e.detail.values[0];
		handleChanged();
	}, 300);

	const getMax = (step: number) => {
		let max: number | undefined = undefined;
		if (exclusiveMaximum !== undefined) {
			max = exclusiveMaximum - step;
		} else if (maximum !== undefined) {
			max = maximum;
		}
		return max;
	};

	const getMin = (step: number) => {
		let min: number | undefined = undefined;
		if (exclusiveMinimum !== undefined) {
			min = exclusiveMinimum + step;
		} else if (minimum !== undefined) {
			min = minimum;
		}
		return min;
	};
</script>

<div
	class="argument-card {isHovered ? 'hover' : ''} {isExpanded ? 'expanded' : ''} {isActive
		? 'is-active'
		: ''} mb-1"
>
	<div
		class="argument is-flex is-align-items-center p-2 pr-3"
		role="menuitem"
		tabindex="-1"
		on:mouseenter={() => {
			isHovered = true;
		}}
		on:mouseleave={() => {
			isHovered = false;
		}}
		on:click={() => {
			isExpanded = !isExpanded;
		}}
		on:keydown={handleEnterKey}
	>
		<div class="stroke"></div>

		{#if icon}
			<span
				class="icon is-medium mr-2 {isActive || isExpanded
					? 'has-text-info'
					: isHovered
						? 'has-text-grey'
						: 'has-text-grey-light'}"
			>
				<i class={icon}></i>
			</span>
		{/if}

		<span
			class="name mr-2 {isActive || isExpanded ? 'has-text-info has-text-weight-semibold' : ''}"
		>
			{title}
		</span>

		<span class="tag has-addons ml-auto p-0">
			<span
				class="tag px-1 is-light {isActive || isExpanded
					? 'is-info'
					: isHovered
						? 'is-light'
						: ''} "
			>
				{#if showPrefix && typeof value === 'number'}
					{#if value > 0}
						+
					{:else if value < 0}
						-
					{/if}
					{value >= 0 ? value : value * -1}
				{:else}
					{value}
				{/if}

				{#if unit}
					{unit}
				{/if}
			</span>
			{#if defaultValue !== value}
				<!-- svelte-ignore a11y-interactive-supports-focus -->
				<!-- svelte-ignore a11y-missing-attribute -->
				<!-- svelte-ignore a11y-missing-content -->
				<a
					class="tag is-delete is-light {isActive || isExpanded
						? 'is-info'
						: isHovered
							? 'is-light'
							: ''}"
					on:click={handleClear}
					on:keydown={handleEnterKey}
					role="button"
					data-sveltekit-preload-data="off"
					data-sveltekit-preload-code="off"
				></a>
			{/if}
		</span>
	</div>

	{#if isExpanded}
		{@const step = type === 'integer' ? 1 : 0.1}
		<div class="expanded-container px-3 pb-4">
			{#if description}
				<p class="help">{description}</p>
			{/if}
			{#if type === 'boolean'}
				<div class="field">
					<input
						id="enable-{title}"
						type="checkbox"
						class="switch"
						bind:checked={value}
						on:change={handleChanged}
					/>
					<label class="pb-1" for="enable-{title}">{value ? 'Disable' : 'Enable'} {title}</label>
				</div>
			{:else if ['number', 'integer'].includes(type)}
				{@const max = getMax(step)}
				{@const min = getMin(step)}
				{#if min !== undefined && max !== undefined}
					<Slider
						{min}
						{max}
						{step}
						rest={false}
						flost={true}
						first="label"
						last="label"
						values={[value]}
						bind:showEditor
						on:change={setSliderValue}
					/>
				{:else if typeof value === 'number'}
					<NumberInput
						bind:value
						minValue={min ?? DEFAULT_MINIMUM}
						maxValue={max ?? DEFAULT_MAXIMUM}
						{step}
						on:change={handleChanged}
					/>
				{/if}
			{:else}
				<input class="input" type="text" bind:value on:change={handleChanged} />
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	@use 'bulma-switch/dist/css/bulma-switch.min.css';

	.argument-card {
		border: 1px solid #d4d6d8;
		border-left: 3px solid hsl(0, 0%, 71%);

		&.hover {
			border-left: 3px solid hsl(0, 0%, 48%);
		}
		&.expanded,
		&.is-active {
			border-left: 3px solid hsl(204, 86%, 53%);
		}

		.argument {
			position: relative;
			cursor: pointer;

			min-height: 56px;

			.name {
				line-height: 1.2rem;
			}
		}
	}
</style>
