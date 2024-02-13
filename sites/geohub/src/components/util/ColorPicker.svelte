<script lang="ts">
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import ColorPicker, { ChromeVariant, type RgbaColor } from 'svelte-awesome-color-picker';

	const dispatch = createEventDispatcher();

	export let color: RgbaColor;

	const changeColor = debounce((e) => {
		const newRgba: RgbaColor = e.detail.color.rgba;
		if (
			color.r === newRgba.r &&
			color.g === newRgba.g &&
			color.b === newRgba.b &&
			color.a === newRgba.a
		) {
			return;
		}
		color = newRgba;
		dispatch('changeColor');
	}, 300);
</script>

<div class="default-color-picker-container" data-testid="default-color-picker-container">
	<ColorPicker
		components={ChromeVariant}
		isDialog={false}
		isTextInput={false}
		isAlpha={true}
		sliderDirection="horizontal"
		isOpen={true}
		on:input={changeColor}
		rgb={color}
	/>
</div>

<style lang="scss">
	.default-color-picker-container {
		position: relative;

		:global(.wrapper) {
			margin: 0;
		}
	}
</style>
