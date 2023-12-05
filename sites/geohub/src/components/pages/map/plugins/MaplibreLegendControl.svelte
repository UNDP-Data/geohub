<script context="module" lang="ts">
	import { type LayerListStore } from '$stores';
	import type { ControlPosition, IControl, Map } from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';

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
			const defaultPosition = 'bottom-left';
			return defaultPosition;
		}
	}
</script>

<script lang="ts">
	import { getLayerStyle } from '$lib/helper';
	import { Loader } from '@undp-data/svelte-undp-design';
	import RasterLayer from '../layers/raster/RasterLayer.svelte';
	import VectorLayer from '../layers/vector/VectorLayer.svelte';

	export let map: Map;
	export let layerList: LayerListStore;

	let control: MaplibreLegendControl;
	let buttonDiv: HTMLButtonElement;
	let contentDiv: HTMLDivElement;

	let showContents = true;

	const handleButtonClicked = () => {
		showContents = !showContents;
	};

	onMount(() => {
		control = new MaplibreLegendControl(buttonDiv);
		map.addControl(control, 'bottom-left');
	});

	onDestroy(() => {
		if (control) {
			map.removeControl(control);
			control = undefined;
		}
	});
</script>

<button
	class="legend-button button {!showContents ? 'is-active' : ''}"
	bind:this={buttonDiv}
	on:click={handleButtonClicked}
>
	<span class="icon is-small">
		<i class="fa-solid fa-list"></i>
	</span>
</button>

<div class="contents p-2 {showContents ? 'is-active' : ''}" bind:this={contentDiv}>
	<h2 class="header-title subtitle has-background-light p-2 mb-0">
		Legend

		<button
			class="close-button delete"
			on:click={() => {
				showContents = false;
			}}
		/>
	</h2>

	<div class="legend-contents">
		{#if $layerList?.length > 0}
			{#each $layerList as layer (layer.id)}
				{@const type = getLayerStyle(map, layer.id)?.type}
				{#if type}
					{#if type === 'raster'}
						<RasterLayer {layer} bind:isExpanded={layer.isExpanded} />
					{:else}
						<VectorLayer {layer} bind:isExpanded={layer.isExpanded} />
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

		display: none;

		.header-title {
			position: relative;

			.close-button {
				position: absolute;
				top: 10px;
				right: 10px;
			}
		}

		.legend-contents {
			width: fit-content;
			min-width: 200px;
			max-width: 350px;
			max-height: 350px;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}

	.is-active {
		display: block;
	}
</style>
