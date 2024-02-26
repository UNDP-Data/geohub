<script lang="ts">
	import NumberInput from '$components/util/NumberInput.svelte';
	import { handleEnterKey } from '$lib/helper';
	import type { RasterAlgorithmParameter } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

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
				<NumberInput
					bind:value
					minValue={parameter.minimum ?? -9999}
					maxValue={parameter.exclusiveMaximum ?? 9999}
					{step}
					on:change={handleChanged}
				/>
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
		}
	}
</style>
