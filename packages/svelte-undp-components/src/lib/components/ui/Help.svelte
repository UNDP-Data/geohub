<script lang="ts">
	import { initTooltipTippy } from '$lib/util/initTippy';

	interface Props {
		maxWidth?: number;
		type?: 'info' | 'help';
		size?: 'small' | 'normal' | 'medium' | 'large';
		children?: import('svelte').Snippet;
	}

	let { maxWidth = 300, type = 'info', size = 'small', children }: Props = $props();

	const tippy = initTooltipTippy({
		maxWidth
	});
	let tooltipContent: HTMLElement | undefined = $state();
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
	{@render children?.()}
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
