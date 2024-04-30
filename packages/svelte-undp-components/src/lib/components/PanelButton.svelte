<script lang="ts">
	import { initTippy, initTooltipTippy } from '$lib/util/initTippy.js';

	export let icon: string;
	export let iconDisabled = '';
	export let width: string;
	export let tooltip: string;
	export let disabled = false;
	export let isShow = false;
	export let hideBorder = true;

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
	let tooltipContent: HTMLElement;

	const tippyTooltip = initTooltipTippy();
</script>

<div data-testid="panel-button" class="panel-control" use:tippyTooltip={{ content: tooltip }}>
	<button
		class="panel-button {hideBorder ? 'border-hidden' : ''} button"
		{disabled}
		use:tippy={{ content: tooltipContent }}
	>
		<span class="icon is-small">
			<i class={disabled && iconDisabled ? iconDisabled : icon} />
		</span>
	</button>

	<div class="tooltip" data-testid="tooltip" style="width: {width}" bind:this={tooltipContent}>
		<div class="panel container p-2" style="width: {width}">
			<slot />
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
