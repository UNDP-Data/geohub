<script lang="ts">
	import { initTippy } from '$lib/helper';

	export let maxWidth = 300;

	const tippy = initTippy({
		interactive: false,
		maxWidth: maxWidth
	});
	let tooltipContent: HTMLElement;
</script>

<div class="help icon" role="button" use:tippy={{ content: tooltipContent }}>
	<i class="fa-solid fa-circle-question fa-xl" />
</div>

<div bind:this={tooltipContent} data-testid="help-tooltip-content" class="tooltip p-2">
	<slot />
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.help {
		cursor: pointer;
		padding: 0;
		padding-left: 0.2rem;
		color: gray;

		&:hover {
			color: hsl(204, 86%, 53%);
		}
	}
</style>
