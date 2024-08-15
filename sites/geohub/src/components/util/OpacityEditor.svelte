<script lang="ts">
	import { initTippy, initTooltipTippy, Slider } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';

	export let opacity = 1;

	const dispatch = createEventDispatcher();
	const tippy = initTippy({});
	const tippyTooltip = initTooltipTippy();

	let tooltipContent: HTMLElement;

	const handleChanged = (e) => {
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

<div
	class="opacity-control is-flex is-align-items-center p-1 mr-2"
	use:tippy={{ content: tooltipContent }}
	use:tippyTooltip={{ content: 'Change opacity (0-100%)' }}
>
	<span class="material-symbols-outlined opacity-icon"> opacity </span>
	<span class="opacity-value ml-auto">{opacity * 100}%</span>
</div>

<button
	class="panel-icon"
	on:click={handleVisibilityChanged}
	use:tippyTooltip={{ content: 'Change layer visibility' }}
>
	{#if opacity === 0}
		<i class="fas fa-eye-slash" aria-hidden="true"></i>
	{:else}
		<i class="fas fa-eye" aria-hidden="true"></i>
	{/if}
</button>

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

	.opacity-popup {
		width: 250px;
	}
</style>
