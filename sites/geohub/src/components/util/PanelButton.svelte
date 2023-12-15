<script lang="ts">
	import { initTippy } from '$lib/helper';

	export let icon: string;
	export let iconDisabled = '';
	export let width: string;
	export let tooltip: string;
	export let position: 'top' | 'bottom' | 'right' | 'left' = 'top';
	export let disabled = false;
	export let isShow = false;

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
</script>

<div
	data-testid="panel-button"
	class="panel-control has-tooltip-arrow {`${position === 'top' ? '' : `has-tooltip-${position}`}`}"
	data-tooltip={tooltip}
>
	<button class="panel-button button" {disabled} use:tippy={{ content: tooltipContent }}>
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
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.panel-button {
		border: none;
		outline: none;
		appearance: none;
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
