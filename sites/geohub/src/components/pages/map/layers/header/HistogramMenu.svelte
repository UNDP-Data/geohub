<script lang="ts">
	import { initTippy, isRgbRaster } from '$lib/helper';
	import type { RasterTileMetadata } from '$lib/types';
	import RasterHistogram from '../raster/RasterHistogram.svelte';

	const tippy = initTippy({
		appendTo: document.body,
		maxWidth: 350
	});
	let tooltipContent: HTMLElement;

	export let metadata: RasterTileMetadata;
	const isRgbTile = isRgbRaster(metadata.colorinterp);
</script>

{#if !isRgbTile}
	<!-- svelte-ignore a11y-missing-attribute -->
	<a class="dropdown-item" role="button" tabindex="0" use:tippy={{ content: tooltipContent }}>
		<span class="icon-text">
			<span class="icon">
				<i class="fa-solid fa-chart-column"></i>
			</span>
			<span>Histogram</span>
		</span>
	</a>

	<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
		<button class="delete close"></button>

		<div class="content p-2">
			<RasterHistogram {metadata} />
		</div>
	</div>
{/if}

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.tooltip {
		width: fit-content;
		inset: -10px auto auto 0px !important;

		.close {
			z-index: 10;
			position: absolute;
			top: 5px;
			right: 5px;
		}

		.content {
			text-align: justify;
			text-justify: inter-word;
			word-wrap: break-word;
			font-weight: lighter;
			max-height: 300px;
			overflow-y: hidden;
			overflow-x: hidden;
		}
	}
</style>
