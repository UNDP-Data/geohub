<script lang="ts">
	import { initTippy } from '$lib/helper';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	const layer: LayerSpecification = $map.getStyle()?.layers?.find((l) => l.id === layerId);

	const tippy = initTippy({
		appendTo: document.body,
		placement: 'right',
		maxWidth: 350
	});
	let tooltipContent: HTMLElement;
</script>

<button
	class="editor-button button is-normal has-tooltip-left has-tooltip-arrow"
	use:tippy={{ content: tooltipContent }}
	data-tooltip="Change layer appearance"
>
	<span class="icon is-small">
		<i class="fa-solid fa-sliders fa-lg"></i>
	</span>
</button>

<div bind:this={tooltipContent} class="tooltip p-2">
	<button class="delete close">
		<!-- <i class="fa-solid fa-circle-xmark fa-2x" style="color:#1c1c1c;" /> -->
	</button>

	<p class="title is-5 is-capitalized mb-1">{layer.type} properties</p>

	<div class="controls-container p-2">
		<slot />
	</div>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.editor-button {
		cursor: pointer;
	}

	.tooltip {
		font-size: 13px;
		z-index: 10;
		min-width: 350px;
		max-width: 400px;

		.close {
			position: absolute;
			top: 0.5rem;
			right: 0.6rem !important;
			cursor: pointer;
			z-index: 5;
		}

		.controls-container {
			max-height: 60vh;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}
</style>
