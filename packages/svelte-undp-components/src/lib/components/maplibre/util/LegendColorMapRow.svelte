<script lang="ts" module>
	export interface ColorMapRow {
		index?: number;
		color?: number[];
		start?: number | string;
		end?: number | string;
		value?: number;
	}
</script>

<script lang="ts">
	import ColorPicker from '$lib/components/ui/ColorPicker.svelte';
	import { handleEnterKey } from '$lib/util/handleEnterKey';
	import { initTippy } from '$lib/util/initTippy';
	import chroma from 'chroma-js';
	import { onMount, untrack } from 'svelte';
	import type { RgbaColor } from 'svelte-awesome-color-picker';

	const tippy = initTippy({
		appendTo: document.body
	});
	let tooltipContent: HTMLElement | undefined = $state();

	interface Props {
		/**
		 * Color row data
		 */
		colorMapRow: ColorMapRow;
		/**
		 * Colormap name. If colormap name is changed, color will be reset.
		 */
		colorMapName: string;
		/**
		 * If true, it will be unique value mode instead of ranged value mode.
		 */
		hasUniqueValues: boolean;
		/**
		 * If true, it becomes readonly mode.
		 */
		readonly?: boolean;

		onchangeColorMap?: () => void;

		onchangeIntervalValues?: (args: { index: number; id: number | string; value: number }) => void;
	}

	let {
		colorMapRow = $bindable(),
		colorMapName = $bindable(),
		hasUniqueValues = $bindable(),
		readonly = $bindable(false),
		onchangeColorMap = () => {},
		onchangeIntervalValues = () => {}
	}: Props = $props();

	let signal = $state();

	let color: RgbaColor = $state();
	let colorPickerStyle: string = $state('');

	// set color based on default value
	const setColorFromProp = () => {
		const rowColor: number[] = colorMapRow.color;
		const r = rowColor[0];
		const g = rowColor[1];
		const b = rowColor[2];
		const a = rowColor[3];

		color = {
			r,
			g,
			b,
			a
		};
	};

	const getColorPickerStyle = () => {
		if (!color) return;
		let rgba = chroma(color.r, color.g, color.b, color.a).css();
		const rgba2 = chroma(colorMapRow.color).css();
		if (rgba !== rgba2) {
			rgba = rgba2;
			setColorFromProp();
		}
		colorPickerStyle = `caret-color:${rgba}; background-color: ${rgba}`;
		return colorPickerStyle;
	};

	const handleVisibilityChanged = () => {
		if (isVisible) {
			color.a = 1;
		} else {
			[(color.a = 0)];
		}
		updateColorMap(color);
	};

	// set color of display and dispatch to update map
	const updateColorMap = (colorSelected: RgbaColor) => {
		if (colorSelected) {
			try {
				const { r, g, b, a } = colorSelected;
				let rgba: number[] = [r, g, b, a];

				/*the fix below is necessary becuse the Color picker has some rounding errors generated by
          computing the position of the color selector in percentages and emits an incredible number of events
          which make the color returned change slightly on multiple consecutive invocations without touching the selector
          for example and this triggers map rerendering in vain
          The solutin is to detect changes for every dimension of the color, sum the differences and only
          update the map on a consistent color change (larger delta)
        */
				colorMapRow.color = rgba;
				colorPickerStyle = getColorPickerStyle();
				if (onchangeColorMap) onchangeColorMap();
			} catch (e) {
				console.log(e);
			}
		}
	};

	const handleColorChanged = () => {
		updateColorMap(color);
	};

	const handleInput = (e) => {
		const id = e.target.id;
		const value = (e.target as HTMLInputElement).value;
		signal = value;
		if (onchangeIntervalValues) {
			onchangeIntervalValues({
				index: colorMapRow.index as number,
				id,
				value: parseFloat(value)
			});
		}
	};
	$effect(() => {
		if (colorMapRow.color) {
			untrack(() => {
				getColorPickerStyle();
			});
		}
	});
	// load color map upon change of layer color map name
	$effect(() => {
		if (colorMapName) {
			untrack(() => {
				setColorFromProp();
			});
		}
	});
	let isVisible = $state(true);

	$effect(() => {
		if (color.a === 0) {
			isVisible = false;
		}
	});

	onMount(() => {
		getColorPickerStyle();
	});
</script>

<!--
the key statement is necessary as it forces to rerender the legend item in case an invalid valus is provided
-->
{#key signal}
	<tr>
		<td class="is-flex" style="min-width: 120px;">
			{#if readonly}
				<div class=" icon">
					{#if isVisible}
						<i class="fa-solid fa-eye"></i>
					{:else}
						<i class="fa-solid fa-eye-slash"></i>
					{/if}
				</div>
				<div
					title="Color Map Control"
					class="discrete-readonly ml-2"
					style="{colorPickerStyle}; width:100%; height:20px"
				></div>
			{:else}
				<div
					role="button"
					tabindex="0"
					class="visible-button icon"
					onclick={() => {
						isVisible = !isVisible;
						handleVisibilityChanged();
					}}
					onkeydown={handleEnterKey}
				>
					{#if isVisible}
						<i class="fa-solid fa-eye"></i>
					{:else}
						<i class="fa-solid fa-eye-slash"></i>
					{/if}
				</div>

				<div
					title="Color Map Control"
					use:tippy={{ content: tooltipContent }}
					class="discrete ml-2"
					style="{colorPickerStyle}; width:100%; height:20px"
				></div>
				<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
					<ColorPicker bind:color onchange={handleColorChanged} />
				</div>
			{/if}
		</td>
		{#if !hasUniqueValues}
			<td style="min-width: 100px;">
				<input
					class="number-input"
					id="start"
					type="number"
					value={colorMapRow.start}
					onchange={handleInput}
					required
					disabled={readonly}
				/>
			</td>
		{/if}

		<td style="width: 100%;">
			{#if hasUniqueValues}
				<span class="label-value">
					{#if colorMapRow.end}
						{isNaN(parseFloat(`${colorMapRow.end}`)) ? colorMapRow.end : colorMapRow.start}
					{:else}
						Others
					{/if}
				</span>
			{:else}
				<input
					class="number-input"
					type="number"
					id="end"
					value={colorMapRow.end}
					onchange={handleInput}
					required
					disabled={readonly}
				/>
			{/if}
		</td>
	</tr>
{/key}

<style lang="scss">
	$input-margin: 5px !important;

	.tooltip {
		z-index: 10;
		height: 250px;
		width: 260px;
	}

	.visible-button {
		cursor: pointer;
	}

	.number-input {
		width: 100%;
		text-align: left;
		border: none;
		background-color: transparent;
	}

	.discrete {
		cursor: pointer !important;
		height: 20px;
		width: 20px;
		border: 1px solid gray;
	}

	.discrete-readonly {
		cursor: default !important;
		border: 1px solid gray;
	}

	:global(.discrete):hover {
		padding: 0;
		border: 2px solid rgb(0, 0, 0);
	}

	input:focus {
		outline: none;
		background: rgb(220, 220, 220, 0.3);
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}

	.label-value {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
	}
</style>
