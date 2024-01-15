<script context="module" lang="ts">
	export interface SimulationArgument {
		id: string;
		icon: string;
		value: number;
		units: string;
		label: string;
		abs_limits: {
			min: number;
			max: number;
		};
		limits: {
			min: number;
			max: number;
		};
		param_name: string;
		type: 'numeric';
		widget_type?: 'slider';
	}
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/helper';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';

	const dispatch = createEventDispatcher();

	export let argument: SimulationArgument;
	export let value: number = argument.value;

	let isHovered = false;
	export let isExpanded = false;
	$: isActive = argument.value !== value;

	const update = debounce((v: number) => {
		value = v;
		const updated: SimulationArgument = JSON.parse(JSON.stringify(argument));
		updated.value = value;
		dispatch('change', updated);
	}, 300);

	const handleClear = () => {
		update(argument.value);
	};

	const setSliderValue = async (e) => {
		update(e.detail.value);
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

		<span
			class="icon is-medium mr-2 {isActive
				? 'has-text-link'
				: isHovered || isExpanded
					? 'has-text-info'
					: ''}"
		>
			<i class="fas {argument.icon} fa-lg"></i>
		</span>
		<span
			class="name mr-2 {isActive
				? 'has-text-link'
				: isHovered || isExpanded
					? 'has-text-info'
					: ''}">{argument.label}</span
		>

		<span class="tag has-addons ml-auto p-0">
			<span
				class="tag px-1 is-light {isActive ? 'is-link' : isHovered || isExpanded ? 'is-info' : ''} "
			>
				{#if value > 0}
					+
				{:else if value < 0}
					-
				{/if}
				{value >= 0 ? value : value * -1}
				{argument.units}
			</span>
			{#if argument.value !== value}
				<!-- svelte-ignore a11y-interactive-supports-focus -->
				<!-- svelte-ignore a11y-missing-attribute -->
				<!-- svelte-ignore a11y-missing-content -->
				<a
					class="tag is-delete is-light {isActive
						? 'is-link'
						: isHovered || isExpanded
							? 'is-info'
							: ''}"
					on:click={handleClear}
					on:keydown={handleEnterKey}
					role="button"
					data-sveltekit-preload-data="off"
					data-sveltekit-preload-code="off"
				></a>
			{/if}
			<!-- {#if argument.value !== value}
				<button class="delete is-small" on:click={handleClear}></button>
			{/if} -->
		</span>
	</div>

	{#if isExpanded}
		{@const step = Math.round((argument.limits.max - argument.limits.min) * 1e-2 * 200)}
		<div class="expanded-container px-3 pb-4">
			<div class=" range-slider m-auto">
				<RangeSlider
					min={argument.limits.min}
					max={argument.limits.max}
					step={0.1}
					pipstep={step}
					rest={true}
					float
					first="label"
					last="label"
					values={[value]}
					on:stop={setSliderValue}
					springValues={{
						stiffness: 1,
						damping: 1
					}}
					pips="true"
					all="label"
				/>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.argument-card {
		border: 1px solid #d4d6d8;
		border-left: 3px solid #55606e;

		&.expanded,
		&.hover {
			border-left: 3px solid hsl(204, 86%, 53%);
		}
		&.is-active {
			border-left: 3px solid #006eb5;
		}

		.argument {
			position: relative;
			cursor: pointer;

			min-height: 56px;

			.name {
				line-height: 1.2rem;
			}
		}

		.expanded-container {
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
