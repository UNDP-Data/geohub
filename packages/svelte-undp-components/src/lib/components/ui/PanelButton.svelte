<script lang="ts">
	import { initTippy, initTooltipTippy } from '$lib/util/initTippy.js';

	interface Props {
		icon: string;
		iconDisabled?: string;
		width: string;
		tooltip: string;
		disabled?: boolean;
		isShow?: boolean;
		hideBorder?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		icon = $bindable(),
		iconDisabled = $bindable(''),
		width = $bindable(),
		tooltip = $bindable(),
		disabled = $bindable(false),
		isShow = $bindable(false),
		hideBorder = $bindable(true),
		children
	}: Props = $props();

	const tippy = initTippy({
		placement: 'bottom-end',
		onShow(instance) {
			isShow = true;
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			isShow = false;
			instance.popper.querySelector('.close')?.removeEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement | undefined = $state();

	const tippyTooltip = initTooltipTippy();
</script>

<div data-testid="panel-button" class="panel-control" use:tippyTooltip={{ content: tooltip }}>
	<button
		class="panel-button {hideBorder ? 'border-hidden' : ''} button"
		{disabled}
		use:tippy={{ content: tooltipContent }}
		aria-label="show tooltip"
	>
		<span class="icon is-small">
			<i class={disabled && iconDisabled ? iconDisabled : icon}></i>
		</span>
	</button>

	<div class="tooltip" data-testid="tooltip" style="width: {width}" bind:this={tooltipContent}>
		<div class="panel container p-2" style="width: {width}">
			{@render children?.()}
		</div>
	</div>
</div>

<style lang="scss">
	.panel-button {
		border: 1px solid black;

		&.border-hidden {
			border: none;
			outline: none;
			appearance: none;
			box-shadow: none;
		}
	}

	.panel-control {
		position: relative;

		.panel {
			cursor: default;
		}
	}

	.tooltip {
		margin: 0;
		padding: 0;
		z-index: 20;
	}
</style>
