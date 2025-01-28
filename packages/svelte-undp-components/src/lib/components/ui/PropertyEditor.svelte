<script module lang="ts">
	type ValueType = number | boolean | string;
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { Switch } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import NumberInput from './NumberInput.svelte';
	import Slider from './Slider.svelte';

	const dispatch = createEventDispatcher();

	interface Props {
		/**
		 * Property ID
		 */
		id: string;
		/**
		 * Type of editor.
		 * integer: show NumberInput element or slider. Slider is only shown if both (exclusive)minimum and (exclusive)maximum are set
		 * number: show NumberInput element or slider. Slider is only shown if both (exclusive)minimum and (exclusive)maximum are set
		 * string: show textbox
		 * boolean: show toggle switch control
		 */
		type: 'integer' | 'number' | 'boolean' | 'string';
		/**
		 * Title of property
		 */
		title: string;
		/**
		 * Optional Description of property
		 */
		description?: string;
		/**
		 * Optional. Fontawesome Icon class name. eg, 'fas fa-user fa-lg'
		 */
		icon?: string;
		/**
		 * Value
		 */
		value: ValueType;
		/**
		 * Default value
		 */
		defaultValue: ValueType;
		/**
		 * Optional. Exclusive maximum value. n < exclusiveMaximum
		 * it is only used when 'type' is either integer or number
		 */
		exclusiveMaximum?: number | undefined;
		/**
		 * Optional. maximum value. n < maximum
		 * if exclusiveMaximum is used, maximum will not be used.
		 * it is only used when 'type' is either integer or number.
		 */
		maximum?: number | undefined;
		/**
		 * Optional. Exclusive minimum value. n < exclusiveMinimum
		 * it is only used when 'type' is either integer or number.
		 */
		exclusiveMinimum?: number | undefined;
		/**
		 * Optional. minimum value. n < minimum
		 * if exclusiveMinimum is used, minimum will not be used.
		 * it is only used when 'type' is either integer or number.
		 */
		minimum?: number | undefined;
		/**
		 * Optional. If true, show +/- prefix in tag. Only available for numeric data type.
		 */
		showPrefix?: boolean;
		/**
		 * Optional. Unit name. It will be shown in tag if specified.
		 */
		unit?: string;
		/**
		 * The state of either expanded or collapsed.
		 */
		isExpanded?: boolean;
		/**
		 * If enabled, show manual text editor (only available when slider is used)
		 */
		showEditor?: boolean;
		showRestPip?: boolean | 'pip' | 'label';
		/**
		 * Whether to show a pip or label for every value. Possible values are:
		 * - false all values in the Slider will not have a pip or label
		 * - pip a pip (only) will be shown for all values
		 * - label label (and pip) is shown on all values
		 *
		 * It is only available when slider is shown
		 */
		showAll?: boolean | 'pip' | 'label';
		formatter?: (value: number, index: number, percent: number) => number | string;
	}

	let {
		id = $bindable(),
		type = $bindable(),
		title = $bindable(),
		description = $bindable(''),
		icon = $bindable(''),
		value = $bindable(),
		defaultValue = $bindable(),
		exclusiveMaximum = $bindable(undefined),
		maximum = $bindable(undefined),
		exclusiveMinimum = $bindable(undefined),
		minimum = $bindable(undefined),
		showPrefix = $bindable(false),
		unit = $bindable(''),
		isExpanded = $bindable(false),
		showEditor = $bindable(false),
		showRestPip = $bindable(false),
		showAll = $bindable(false),
		formatter = (value) => {
			return value;
		}
	}: Props = $props();

	const DEFAULT_MINIMUM = -9999;
	const DEFAULT_MAXIMUM = 9999;

	let isHovered = $state(false);
	let isActive = $derived(defaultValue !== value);

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
		onmouseenter={() => {
			isHovered = true;
		}}
		onmouseleave={() => {
			isHovered = false;
		}}
		onclick={() => {
			isExpanded = !isExpanded;
		}}
		onkeydown={handleEnterKey}
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
				{:else if typeof value === 'number'}
					{@const formattedValue = formatter(value, 0, 0)}
					{formattedValue}
				{:else}
					{value}
				{/if}

				{#if unit}
					{unit}
				{/if}
			</span>
			{#if defaultValue !== value}
				<!-- svelte-ignore a11y_interactive_supports_focus -->
				<!-- svelte-ignore a11y_missing_attribute -->
				<a
					class="tag is-delete is-light {isActive || isExpanded
						? 'is-info'
						: isHovered
							? 'is-light'
							: ''}"
					onclick={handleClear}
					onkeydown={handleEnterKey}
					role="button"
					data-sveltekit-preload-data="off"
					data-sveltekit-preload-code="off"
					aria-label="clear"
				></a>
			{/if}
		</span>
	</div>

	{#if isExpanded}
		{@const step = type === 'integer' ? 1 : 0.1}
		<div class="expanded-container px-5 pb-4">
			{#if description}
				<p class="help">{description}</p>
			{/if}
			{#if type === 'boolean'}
				<div class="field">
					<Switch
						bind:toggled={value as boolean}
						on:change={handleChanged}
						showValue={true}
						toggledText="Enable {title}"
						untoggledText="Disable {title}"
					/>
				</div>
			{:else if ['number', 'integer'].includes(type)}
				{@const max = getMax(step)}
				{@const min = getMin(step)}
				{#if min !== undefined && max !== undefined}
					<Slider
						{min}
						{max}
						{step}
						bind:rest={showRestPip}
						floatLabel={true}
						first="label"
						last="label"
						values={[value as number]}
						bind:all={showAll}
						bind:showEditor
						on:change={setSliderValue}
						{formatter}
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
				<input class="input" type="text" bind:value onchange={handleChanged} />
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
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
