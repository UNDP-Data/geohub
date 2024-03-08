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
	import FloatingPanel from '$components/util/FloatingPanel.svelte';
	import { draggable, type DragOptions } from '@neodrag/svelte';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';

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

	const tippyTooltip = initTooltipTippy();

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

	const handleLayerToggled = (e) => {
		const layerId = e.detail.layerId;
		const isExpanded = e.detail.isExpanded;
		layerList.setIsExpanded(layerId, isExpanded);
	};

	const expandAllDisabled = () => {
		if ($layerList.length === 0) return true;
		return $layerList.filter((l) => l.isExpanded === true)?.length === $layerList.length;
	};

	const collapseAllDisabled = () => {
		if ($layerList.length === 0) return true;
		return $layerList.filter((l) => l.isExpanded === false)?.length === $layerList.length;
	};

	const handleExpandAll = () => {
		if ($layerList.length === 0) return;
		$layerList?.forEach((l) => {
			l.isExpanded = true;
		});
		$layerList = [...$layerList];
	};

	const handleCollapseAll = () => {
		if ($layerList.length === 0) return;
		$layerList?.forEach((l) => {
			l.isExpanded = false;
		});
		$layerList = [...$layerList];
	};
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

{#if $layerList?.length > 0}
	<div
		class="contents {show ? 'is-active' : ''}"
		bind:this={contentDiv}
		use:draggable={dragOptions}
	>
		<FloatingPanel
			title="Legend"
			on:close={() => {
				show = false;
			}}
		>
			<div class="is-flex is-align-items-center layer-header pt-2 px-4">
				<div class="layer-header-buttons buttons">
					{#key $layerList}
						<button
							class="button m-0 px-4"
							disabled={expandAllDisabled()}
							on:click={handleExpandAll}
							use:tippyTooltip={{ content: 'Expand all layers' }}
						>
							<span class="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="25"
									viewBox="0 0 24 25"
									fill="none"
								>
									<mask
										id="mask0_2498_5843"
										style="mask-type:alpha"
										maskUnits="userSpaceOnUse"
										x="0"
										y="0"
										width="24"
										height="25"
									>
										<rect y="0.301025" width="24" height="24" fill="#D9D9D9" />
									</mask>
									<g mask="url(#mask0_2498_5843)">
										<path
											d="M4 22.301V20.301H20V22.301H4ZM12 19.301L8 15.301L9.4 13.901L11 15.451V9.15103L9.4 10.701L8 9.30103L12 5.30103L16 9.30103L14.6 10.701L13 9.15103V15.451L14.6 13.901L16 15.301L12 19.301ZM4 4.30103V2.30103H20V4.30103H4Z"
											fill="#55606E"
										/>
									</g>
								</svg>
							</span>
						</button>

						<button
							class="button m-0 px-4"
							disabled={collapseAllDisabled()}
							use:tippyTooltip={{ content: 'Collapse all layers' }}
							on:click={handleCollapseAll}
						>
							<span class="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="25"
									viewBox="0 0 24 25"
									fill="none"
								>
									<mask
										id="mask0_2498_5837"
										style="mask-type:alpha"
										maskUnits="userSpaceOnUse"
										x="0"
										y="0"
										width="24"
										height="25"
									>
										<rect y="0.301025" width="24" height="24" fill="#D9D9D9" />
									</mask>
									<g mask="url(#mask0_2498_5837)">
										<path
											d="M4 14.301V12.301H20V14.301H4ZM4 11.301V9.30103H20V11.301H4ZM11 22.301V19.101L9.4 20.701L8 19.301L12 15.301L16 19.301L14.6 20.701L13 19.151V22.301H11ZM12 8.30103L8 4.30103L9.4 2.90103L11 4.50103V1.30103H13V4.50103L14.6 2.90103L16 4.30103L12 8.30103Z"
											fill="#55606E"
										/>
									</g>
								</svg>
							</span>
						</button>
					{/key}
				</div>
			</div>

			<div class="legend-contents py-2">
				{#each $layerList as layer (layer.id)}
					{@const props = layer.dataset?.properties}
					{#if props}
						{#if props.is_raster}
							<RasterSimpleLayer
								{layer}
								bind:isExpanded={layer.isExpanded}
								on:toggled={handleLayerToggled}
							/>
						{:else}
							<VectorSimpleLayer
								{layer}
								bind:isExpanded={layer.isExpanded}
								on:toggled={handleLayerToggled}
							/>
						{/if}
					{/if}
				{/each}
			</div>
		</FloatingPanel>
	</div>
{/if}

<style lang="scss">
	$width: 300px;

	button {
		border: none;
		outline: none;
		appearance: none;
	}

	.contents {
		position: absolute;
		top: 40px;
		left: 10px;
		background-color: white;
		z-index: 10;
		display: none;
		width: $width;

		.layer-header-buttons {
			margin-left: auto;
		}

		.legend-contents {
			width: $width;
			max-height: 55vh;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}

	.is-active {
		display: block;
	}
</style>
