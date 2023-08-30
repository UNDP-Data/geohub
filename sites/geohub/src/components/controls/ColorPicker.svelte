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
	<div role="button" class="close is-clickable" title="Close Color Picker" tabindex="0">
		<i class="fa-solid fa-xmark fa-sm" />
	</div>
	<ColorPicker
		components={ChromeVariant}
		isPopup={true}
		isInput={false}
		isTextInput={false}
		isAlpha={true}
		toRight={true}
		isOpen={true}
		on:input={changeColor}
		rgb={color}
	/>
</div>

<style lang="scss">
	.default-color-picker-container {
		position: relative;

		:global(.wrapper) {
			padding: 0;
		}

		.close {
			position: absolute;
			right: 10px;
			z-index: 100;
		}
	}

	// picker container
	:global(.isPopup, .picker) {
		border: 0;
		cursor: pointer;
	}

	:global(div.isOpen.isPopup) {
		border: 0;
		margin: 0;
		padding: 10px;
	}

	:global(div.isOpen.isPopup div:nth-child(2), div.isOpen.isPopup div:nth-child(3)) {
		height: 10px;
	}
</style>
