<script lang="ts">
	import { initTippy, initTooltipTippy } from '$lib/util/initTippy.js';
	import Slider from './Slider.svelte';

	interface Props {
		opacity: number;
		showOpacity?: boolean;
		onchange?: (opacity: number) => void;
	}

	let { opacity = $bindable(), showOpacity = true, onchange = () => {} }: Props = $props();

	$effect(() => {
		if (opacity === undefined) {
			opacity = 1;
		}
	});

	const tippy = initTippy({});
	const tippyTooltip = initTooltipTippy();

	let tooltipContent: HTMLElement | undefined = $state();

	const handleChanged = (values: number[]) => {
		opacity = values[0] / 100;
		if (onchange) onchange(opacity);
	};

	const handleVisibilityChanged = () => {
		opacity = opacity === 0 ? 1 : 0;
		if (onchange) onchange(opacity);
	};

	// onMount(() => {
	// 	opacity = opacity > 1 ? opacity / 100 : opacity;
	// });
</script>

<div class="is-flex is-align-items-center">
	{#if showOpacity}
		{#key opacity}
			<div
				class="opacity-control is-flex is-align-items-center p-1 mr-2"
				use:tippy={{ content: tooltipContent }}
				use:tippyTooltip={{ content: 'Change opacity (0-100%)' }}
			>
				<span class="material-symbols-outlined opacity-icon"> opacity </span>
				<span class="opacity-value ml-auto">{`${(opacity * 100).toFixed(0)}`}%</span>
			</div>
		{/key}

		<div class="opacity-popup" bind:this={tooltipContent}>
			<Slider
				min={0}
				max={100}
				values={[opacity * 100]}
				step={1}
				rest={false}
				pips={true}
				suffix="%"
				onchange={handleChanged}
			/>
		</div>
	{/if}

	<button
		class="mt-1"
		onclick={handleVisibilityChanged}
		use:tippyTooltip={{ content: 'Change layer visibility' }}
	>
		{#key opacity}
			{#if opacity === 0}
				<span class="material-symbols-outlined visibility-icon"> visibility_off </span>
			{:else}
				<span class="material-symbols-outlined visibility-icon"> visibility </span>
			{/if}
		{/key}
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
