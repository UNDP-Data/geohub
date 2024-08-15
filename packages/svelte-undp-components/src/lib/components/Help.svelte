<script lang="ts">
	import { initTooltipTippy } from '$lib/util/initTippy.js';

	export let maxWidth = 300;
	export let type: 'info' | 'help' = 'info';
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'small';

	const tippy = initTooltipTippy({
		maxWidth
	});
	let tooltipContent: HTMLElement;
</script>

<div class="help icon m-0" role="button" use:tippy={{ content: tooltipContent }}>
	<span class="material-symbols-outlined {size}">
		{#if type === 'info'}
			info
		{:else}
			help
		{/if}
	</span>
</div>

<div bind:this={tooltipContent} data-testid="help-tooltip-content" class="tooltip p-2">
	<slot />
</div>

<style lang="scss">
	.help {
		cursor: pointer;

		.small {
			font-size: 16px;
		}

		.normal {
			font-size: 24px;
		}

		.medium {
			font-size: 36px;
		}

		.large {
			font-size: 48px;
		}
	}
</style>
