<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import chroma from 'chroma-js';

	import ColorPicker from '$components/controls/ColorPicker.svelte';
	import type { RgbaColor } from 'svelte-awesome-color-picker';
	import { initTippy } from '$lib/helper';

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	const dispatch = createEventDispatcher();

	export let rgba = `rgba(0,0,0,1)`;

	let color: RgbaColor = {
		r: chroma(rgba).rgba()[0],
		g: chroma(rgba).rgba()[1],
		b: chroma(rgba).rgba()[2],
		a: chroma(rgba).rgba()[3]
	};

	const setColor = () => {
		rgba = `rgba(${Math.floor(color.r)},${Math.floor(color.g)},${Math.floor(color.b)},${color.a})`;
		dispatch('change', {
			color: rgba
		});
	};
</script>

<div
	class="color-palette"
	data-testid="color-palette"
	use:tippy={{ content: tooltipContent }}
	title={rgba}
	style="background: {rgba};"
/>
<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
	<ColorPicker bind:color on:changeColor={setColor} />
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.color-palette {
		border: 1px solid hsl(0, 0%, 0%);
		cursor: pointer;
		height: 20px;
		padding: 1px;
		width: 20px;

		&:hover {
			border: 1px solid hsl(204, 86%, 53%);
			padding: 0;
		}
	}

	$tooltip-background: #fff;

	.tooltip {
		padding: 0;
		height: 255px;
		width: 260px;
	}
</style>
