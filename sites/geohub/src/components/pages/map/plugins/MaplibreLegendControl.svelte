<script context="module" lang="ts">
	import {
		createLegendReadonlyStore,
		LEGEND_READONLY_CONTEXT_KEY,
		type LayerListStore,
		type LegendReadonlyStore
	} from '$stores';
	import type { ControlPosition, IControl, Map } from 'maplibre-gl';
	import { onDestroy, onMount, setContext } from 'svelte';

	export class MaplibreLegendControl implements IControl {
		private map: Map;
		private controlContainer: HTMLElement;
		private buttonDiv: HTMLButtonElement;

		constructor(buttonDiv: HTMLButtonElement) {
			this.buttonDiv = buttonDiv;
		}

		onAdd(map: Map): HTMLElement {
			this.map = map;

			this.controlContainer = document.createElement('div');
			this.controlContainer.classList.add('maplibregl-ctrl');
			this.controlContainer.classList.add('maplibregl-ctrl-group');
			this.controlContainer.appendChild(this.buttonDiv);

			return this.controlContainer;
		}

		onRemove(): void {
			if (
				!this.controlContainer ||
				!this.controlContainer.parentNode ||
				!this.map ||
				!this.buttonDiv
			) {
				return;
			}
			this.controlContainer.parentNode.removeChild(this.controlContainer);
			this.map = undefined;
		}

		getDefaultPosition(): ControlPosition {
			const defaultPosition = 'top-right';
			return defaultPosition;
		}
	}
</script>

<script lang="ts">
	import RasterSimpleLayer from '$components/pages/map/layers/raster/RasterSimpleLayer.svelte';
	import VectorSimpleLayer from '$components/pages/map/layers/vector/VectorSimpleLayer.svelte';
	import { getLayerStyle } from '$lib/helper';
	import { draggable, type DragOptions } from '@neodrag/svelte';
	import { Loader } from '@undp-data/svelte-undp-design';

	export let map: Map;
	export let layerList: LayerListStore;
	export let show = true;
	export let readonly = true;

	const legendReadonly: LegendReadonlyStore = createLegendReadonlyStore();
	$legendReadonly = readonly;
	setContext(LEGEND_READONLY_CONTEXT_KEY, legendReadonly);

	let control: MaplibreLegendControl;
	let buttonDiv: HTMLButtonElement;
	let contentDiv: HTMLDivElement;

	let dragOptions: DragOptions = {
		bounds: map.getContainer()
	};

	const handleButtonClicked = () => {
		show = !show;
	};

	onMount(() => {
		control = new MaplibreLegendControl(buttonDiv);
		map.addControl(control, 'top-right');
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});
</script>

<button
	class="legend-button button {!show ? 'is-active' : ''}"
	bind:this={buttonDiv}
	on:click={handleButtonClicked}
>
	<span class="icon is-small">
		<i class="fa-solid fa-list"></i>
	</span>
</button>

<div
	class="contents p-2 {show ? 'is-active' : ''}"
	bind:this={contentDiv}
	use:draggable={dragOptions}
>
	<h2 class="header-title subtitle has-background-light p-2 mb-0">
		<span> Legend </span>

		<button
			class="close-button delete"
			on:click={() => {
				show = false;
			}}
		/>
	</h2>

	<div class="legend-contents">
		{#if $layerList?.length > 0}
			{#each $layerList as layer (layer.id)}
				{@const type = getLayerStyle(map, layer.id)?.type}
				{#if type}
					{#if type === 'raster'}
						<RasterSimpleLayer {layer} />
					{:else}
						<VectorSimpleLayer {layer} />
					{/if}
				{/if}
			{/each}
		{:else}
			<div class="is-flex is-justify-content-center">
				<Loader size="medium" />
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.legend-button {
		display: none;
	}

	.contents {
		position: absolute;
		top: 40px;
		left: 10px;
		background-color: white;
		z-index: 10;
		display: none;

		.header-title {
			position: relative;
			cursor: grab;

			.close-button {
				position: absolute;
				top: 5px;
				right: 5px;
			}
		}

		.legend-contents {
			width: fit-content;
			min-width: 200px;
			max-width: 350px;
			max-height: 60vh;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}

	.is-active {
		display: block;
	}
</style>
