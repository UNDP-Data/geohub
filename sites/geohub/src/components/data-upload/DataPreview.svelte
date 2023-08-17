<script lang="ts">
	import { initTippy } from '$lib/helper';
	import DataPreviewContent from './DataPreviewContent.svelte';

	let isLoadMap = false;

	const tippy = initTippy({
		placement: 'bottom',
		maxWidth: 400,
		onShow(instance) {
			isLoadMap = true;
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement;

	export let id: string;
	export let url: string;
	export let size: 'is-small' | 'is-normal' | 'is-medium' | 'is-large' = 'is-small';
	export let disabled = false;
</script>

<button
	class="button is-primary table-button {size}"
	type="button"
	{disabled}
	use:tippy={{ content: tooltipContent }}
>
	<span class="icon">
		<i class="fa-solid fa-map" />
	</span>
	<span>Preview</span>
</button>

<div bind:this={tooltipContent} class="tooltip p-2">
	<DataPreviewContent bind:id bind:url bind:isLoadMap />
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.tooltip {
		// font-size: 13px;
		z-index: 10;
		width: 400px;
	}
</style>
