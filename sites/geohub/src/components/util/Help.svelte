<script lang="ts">
	import { initTooltipTippy } from '$lib/helper';

	export let maxWidth = 300;

	const tippy = initTooltipTippy({
		maxWidth
	});
	let tooltipContent: HTMLElement;
</script>

<div class="help icon has-text-grey-dark" role="button" use:tippy={{ content: tooltipContent }}>
	<i class="fa-solid fa-circle-question fa-lg" />
</div>

<div bind:this={tooltipContent} data-testid="help-tooltip-content" class="tooltip p-2">
	<slot />
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';

	.help {
		cursor: pointer;
	}
</style>
