<script lang="ts">
	import type { RasterAlgorithmParameter } from '$lib/types';
	import { handleEnterKey, NumberInput } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';

	const dispatch = createEventDispatcher();

	export let id: string;
	export let parameter: RasterAlgorithmParameter;
	export let value: unknown;

	let isHovered = false;
	export let isExpanded = false;
	$: isActive = parameter.default !== value;

	const handleClear = () => {
		value = parameter.default;
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

	const setSliderValue = debounce((e) => {
		value = e.detail.value;
		handleChanged();
	}, 300);

	const getMax = (step: number) => {
		let max: number;
		if (parameter.exclusiveMaximum !== undefined) {
			max = parameter.exclusiveMaximum - step;
		} else if (parameter?.maximum !== undefined) {
			max = parameter.maximum;
		}
		return max;
	};

	const getMin = (step: number) => {
		let min: number;
		if (parameter.exclusiveMinimum !== undefined) {
			min = parameter.exclusiveMinimum + step;
		} else if (parameter?.minimum !== undefined) {
			min = parameter.minimum;
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

		<span class="name mr-2 {isActive || isExpanded ? 'has-text-info has-text-weight-semibold' : ''}"
			>{parameter.title}</span
		>

		<span class="tag has-addons ml-auto p-0">
			<span
				class="tag px-1 is-light {isActive || isExpanded
					? 'is-info'
					: isHovered
						? 'is-light'
						: ''} "
			>
				{value}
			</span>
			{#if parameter.default !== value}
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
		{@const step = parameter.type === 'integer' ? 1 : 0.1}
		<div class="expanded-container px-3 pb-4">
			{#if parameter.description}
				<p class="help">{parameter.description}</p>
			{/if}
			{#if parameter.type === 'boolean'}
				<div class="field">
					<input
						id="enable-{parameter.title}"
						type="checkbox"
						class="switch"
						bind:checked={value}
						on:change={handleChanged}
					/>
					<label class="pb-1" for="enable-{parameter.title}"
						>{value ? 'Disable' : 'Enable'} {parameter.title}</label
					>
				</div>
			{:else if ['number', 'integer'].includes(parameter.type)}
				{@const max = getMax(step)}
				{@const min = getMin(step)}
				{#if parameter.minimum !== undefined && max !== undefined}
					<div class=" range-slider m-auto">
						<RangeSlider
							{min}
							{max}
							{step}
							rest={false}
							float={step === 1 ? false : true}
							first="label"
							last="label"
							values={[value]}
							on:stop={setSliderValue}
							pips="true"
						/>
					</div>
				{:else}
					<NumberInput
						bind:value
						minValue={min ?? -9999}
						maxValue={max ?? 9999}
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

			.range-slider {
				--range-handle-focus: #2196f3;
				--range-handle-inactive: #2196f3;
				--range-handle: #2196f3;
				--range-range-inactive: #2196f3;
				margin: 0;
				font-size: 10px;
			}
		}
	}
</style>
