<script lang="ts">
	import DataCardInfo from '$components/data-view/DataCardInfo.svelte';
	import { initTippy } from '$lib/helper';
	import type { Layer } from '$lib/types';

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	export let layer: Layer = undefined;
</script>

<div
	class="has-tooltip-bottom has-tooltip-arrow"
	data-testid="tooltip-container"
	data-tooltip="Show layer info"
>
	<div
		class="icon-selected"
		aria-label="Show layer info"
		tabindex="0"
		role="button"
		use:tippy={{ content: tooltipContent }}
	>
		<i class="fa-solid fa-info-circle sm" />
	</div>
</div>

<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
	<div class="close" title="Close">
		<i class="fa-solid fa-xmark sm" />
	</div>

	<div class="data-card">
		<DataCardInfo bind:feature={layer.dataset} bind:metadata={layer.info} />
	</div>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';
	@import '../../styles/button-icons-selected.scss';

	.tooltip {
		width: 300px;
		inset: -10px auto auto 0px !important;

		.close {
			text-align: right;
			z-index: 10;
			cursor: pointer;
		}

		.data-card {
			text-align: justify;
			text-justify: inter-word;
			word-wrap: break-word;
			font-weight: lighter;
			max-height: 300px;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}
</style>
