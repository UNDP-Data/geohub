<script lang="ts">
	import ColorPicker from '$lib/components/ui/ColorPicker.svelte';
	import { initTippy } from '$lib/util/initTippy.js';
	import chroma from 'chroma-js';
	import { createEventDispatcher } from 'svelte';
	import type { RgbaColor } from 'svelte-awesome-color-picker';

	const tippy = initTippy({
		appendTo: document.body
	});
	let tooltipContent: HTMLElement | undefined = $state();

	const dispatch = createEventDispatcher();

	interface Props {
		rgba?: string;
		width?: string;
		readonly?: boolean;
	}

	let {
		rgba = $bindable(`rgba(0,0,0,1)`),
		width = $bindable(''),
		readonly = $bindable(false)
	}: Props = $props();

	let color: RgbaColor = $state({
		r: chroma(rgba).rgba()[0],
		g: chroma(rgba).rgba()[1],
		b: chroma(rgba).rgba()[2],
		a: chroma(rgba).rgba()[3]
	});
	let colorStyle = $state('');

	const setColor = () => {
		rgba = chroma.rgb(color.r, color.g, color.b).alpha(color.a).css();
		colorStyle = `height: 32px; width:${width ? `${width}` : '100%'}; background: ${rgba};`;
		dispatch('change', {
			color: rgba
		});
	};
	setColor();
</script>

{#if readonly}
	<div class="color-palette-readonly p-0" data-testid="color-palette" style={colorStyle}></div>
{:else}
	<button
		class="color-palette button p-0"
		data-testid="color-palette"
		style={colorStyle}
		use:tippy={{ content: tooltipContent }}
		aria-label="color-picker"
	>
	</button>

	<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
		<ColorPicker bind:color on:changeColor={setColor} />
	</div>
{/if}

<style lang="scss">
	.color-palette {
		border: 1px solid hsl(0, 0%, 0%);
		cursor: pointer;

		&:hover {
			border: 3px solid hsl(204, 86%, 53%);
		}
	}

	.color-palette-readonly {
		border: 1px solid hsl(0, 0%, 0%);
	}

	$tooltip-background: #fff;

	.tooltip {
		height: fit-content;
		width: 260px;
	}
</style>
