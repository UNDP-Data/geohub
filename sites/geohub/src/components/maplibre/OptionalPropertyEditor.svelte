<script lang="ts">
	import { handleEnterKey, initTippy } from '$lib/helper';
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

<button class="editor-button button is-primary is-normal" use:tippy={{ content: tooltipContent }}>
	<span class="icon is-small">
		<i class="fa-solid fa-palette fa-lg" />
	</span>
</button>

<div bind:this={tooltipContent} class="tooltip p-2">
	<span class="close icon" role="button" tabindex="0" on:keydown={handleEnterKey}>
		<i class="fa-solid fa-circle-xmark fa-2x" style="color:#1c1c1c;" />
	</span>

	<p class="title is-4 is-capitalized">{layer.type} settings</p>

	<div class="controls-container">
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
		width: 260px;

		.close {
			position: absolute;
			top: 0.5rem;
			right: 0.6rem !important;
			cursor: pointer;
			z-index: 5;
		}

		.controls-container {
			max-height: 80vh;
			overflow-y: auto;
		}
	}
</style>
