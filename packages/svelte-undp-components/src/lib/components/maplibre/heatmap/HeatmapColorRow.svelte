<script lang="ts" module>
	import type { RgbaColor } from 'svelte-awesome-color-picker';
	export interface HeatmapColorRow {
		index?: number;
		color?: RgbaColor;
		value?: number;
	}
</script>

<script lang="ts">
	import ColorPicker from '$lib/components/ui/ColorPicker.svelte';
	import { initTippy } from '$lib/util/initTippy.js';
	import chroma from 'chroma-js';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher, onMount } from 'svelte';

	const tippy = initTippy({
		appendTo: document.body
	});
	let tooltipContent: HTMLElement | undefined = $state();

	interface Props {
		colorRow: HeatmapColorRow;
		readonly?: boolean;
	}

	let { colorRow = $bindable(), readonly = $bindable(false) }: Props = $props();

	const dispatch = createEventDispatcher();

	let color: RgbaColor = $state();
	let colorPickerStyle: string = $state('');

	onMount(() => {
		setColorFromProp();
	});

	// set color based on default value
	const setColorFromProp = () => {
		const rowColor: RgbaColor = colorRow.color as RgbaColor;
		const r = rowColor.r;
		const g = rowColor.g;
		const b = rowColor.b;

		color = {
			r,
			g,
			b,
			a: rowColor.a
		};
	};

	// set color of display and dispatch to update map
	const updateColorMap = debounce((colorSelected: RgbaColor) => {
		if (colorSelected) {
			try {
				const rgba: number[] = chroma([colorSelected.r, colorSelected.g, colorSelected.b]).rgba();
				colorRow.color = {
					r: rgba[0],
					g: rgba[1],
					b: rgba[2],
					a: rgba[3] * 255
				};
				colorPickerStyle = getColorPickerStyle(colorRow.color);
				dispatch('changeColorMap');
			} catch (e) {
				console.log(e);
			}
		}
	}, 50);

	const getColorPickerStyle = (color: RgbaColor) => {
		const rgb = [color.r, color.g, color.b].join();
		return `caret-color:rgb(${rgb}); background-color: rgb(${rgb})`;
	};

	$effect(() => {
		colorPickerStyle = getColorPickerStyle(colorRow?.color as RgbaColor);
	});
</script>

<div
	class="color-editor is-mobile is-flex is-flex-direction-column"
	data-testid="heatmap-color-map-row-container"
>
	<div class="color-picker">
		<div
			title="Color Map Control"
			use:tippy={{ content: !readonly ? tooltipContent : undefined }}
			class={!readonly ? 'discrete' : 'discrete-readonly'}
			style="{colorPickerStyle}; width:100%; height:24px"
		></div>
		{#if !readonly}
			<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
				<ColorPicker
					bind:color
					on:changeColor={() => {
						updateColorMap(color);
					}}
				/>
			</div>
		{/if}
	</div>

	<p class="is-size-6 has-text-centered">{colorRow?.value}</p>
</div>

<style lang="scss">
	.color-editor {
		.discrete {
			cursor: pointer;
			height: 20px;
			padding: 1px;
			width: 20px;

			&:hover {
				padding: 0;
				border: 1px solid hsl(204, 86%, 53%);
			}
		}

		.discrete-readonly {
			height: 20px;
			padding: 1px;
			width: 20px;
		}
	}

	.tooltip {
		z-index: 10;
		padding: 0;
		height: 255px;
		width: 260px;
	}
</style>
