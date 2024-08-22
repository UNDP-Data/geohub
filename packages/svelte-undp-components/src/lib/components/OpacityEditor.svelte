<script lang="ts">
	import { initTippy, initTooltipTippy } from '$lib/util/initTippy.js';
	import { createEventDispatcher } from 'svelte';
	import Slider from './Slider.svelte';

	export let opacity = 1;
	export let showOpacity = true;

	const dispatch = createEventDispatcher();
	const tippy = initTippy({});
	const tippyTooltip = initTooltipTippy();

	let tooltipContent: HTMLElement;

	const handleChanged = (e: { detail: { values: number[] } }) => {
		const values = e.detail.values;
		opacity = values[0] / 100;

		dispatch('change', {
			opacity
		});
	};

	const handleVisibilityChanged = () => {
		opacity = opacity === 0 ? 1 : 0;

		dispatch('change', {
			opacity
		});
	};
</script>

<div class="is-flex is-align-items-center">
	{#if showOpacity}
		<div
			class="opacity-control is-flex is-align-items-center p-1"
			use:tippy={{ content: tooltipContent }}
			use:tippyTooltip={{ content: 'Change opacity (0-100%)' }}
		>
			<span class="material-symbols-outlined opacity-icon"> opacity </span>
			<span class="opacity-value ml-auto">{`${(opacity * 100).toFixed(0)}`}%</span>
		</div>

		<div class="opacity-popup" bind:this={tooltipContent}>
			<Slider
				min={0}
				max={100}
				values={[opacity * 100]}
				step={1}
				rest={false}
				pips={true}
				suffix="%"
				on:change={handleChanged}
			/>
		</div>
	{/if}

	<button
		class="mt-1"
		on:click={handleVisibilityChanged}
		use:tippyTooltip={{ content: 'Change layer visibility' }}
	>
		{#if opacity === 0}
			<span class="material-symbols-outlined visibility-icon"> visibility_off </span>
		{:else}
			<span class="material-symbols-outlined visibility-icon"> visibility </span>
		{/if}
	</button>
</div>

<style lang="scss">
	.opacity-control {
		border-radius: 4px;
		background: #edeff0;
		cursor: pointer;
		width: 45px;
		height: 18px;

		.opacity-icon {
			font-size: 12px;
		}

		.opacity-value {
			color: #55606e;
			font-size: 10px;
		}
	}

	.visibility-icon {
		font-size: 16px;
	}

	.opacity-popup {
		width: 250px;
	}
</style>
