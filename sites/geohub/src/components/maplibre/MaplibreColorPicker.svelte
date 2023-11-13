<script lang="ts">
	import chroma from 'chroma-js';
	import { createEventDispatcher } from 'svelte';

	import ColorPicker from '$components/util/ColorPicker.svelte';
	import { initTippy } from '$lib/helper';
	import type { RgbaColor } from 'svelte-awesome-color-picker';

	const tippy = initTippy({
		appendTo: document.body
	});
	let tooltipContent: HTMLElement;

	const dispatch = createEventDispatcher();

	export let rgba = `rgba(0,0,0,1)`;
	export let width: string = undefined;

	let color: RgbaColor = {
		r: chroma(rgba).rgba()[0],
		g: chroma(rgba).rgba()[1],
		b: chroma(rgba).rgba()[2],
		a: chroma(rgba).rgba()[3]
	};

	const setColor = () => {
		rgba = chroma.rgb(color.r, color.g, color.b).alpha(color.a).css();
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
	style="background: {rgba}; {width ? `width: ${width};` : ''}"
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
