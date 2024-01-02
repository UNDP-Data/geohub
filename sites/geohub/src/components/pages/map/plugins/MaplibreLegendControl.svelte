<script context="module" lang="ts">
	import {
		LEGEND_READONLY_CONTEXT_KEY,
		createLegendReadonlyStore,
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
	import { getLayerStyle, initTooltipTippy } from '$lib/helper';
	import { draggable, type DragOptions } from '@neodrag/svelte';
	import { Loader } from '@undp-data/svelte-undp-design';

	export let map: Map;
	export let layerList: LayerListStore;
	export let show = true;
	export let readonly = true;

	let isExpanded = true;

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

<div class="contents {show ? 'is-active' : ''}" bind:this={contentDiv} use:draggable={dragOptions}>
	<div class="legend-header has-background-light is-flex is-align-items-center px-2">
		<span class="is-size-6">Legend</span>
		<div class="header-buttons pl-2">
			<button
				class="button px-0 chevron-button {isExpanded ? 'is-expanded' : ''}"
				on:click={() => {
					isExpanded = !isExpanded;
				}}
			>
				<span class="icon is-small">
					<i class="fa-solid fa-chevron-down"></i>
				</span>
			</button>
			<button
				class="button pl-2"
				on:click={() => {
					show = false;
				}}
			>
				<span class="icon is-small">
					<i class="fas fa-xmark"></i>
				</span>
			</button>
		</div>
	</div>
	<div hidden={!isExpanded}>
		<div class="is-flex is-align-items-center layer-header pt-2">
			<div class="layer-header-buttons buttons">
				{#key $layerList}
					<button
						class="button m-0 px-3"
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
						class="button m-0 px-3"
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

		<div class="legend-contents p-2">
			{#if $layerList?.length > 0}
				{#each $layerList as layer (layer.id)}
					{@const type = getLayerStyle(map, layer.id)?.type}
					{#if type}
						{#if type === 'raster'}
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
			{:else}
				<div class="is-flex is-justify-content-center">
					<Loader size="medium" />
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
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
		width: 300px;

		.legend-header {
			.header-buttons {
				margin-left: auto;
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 5px;

				.chevron-button {
					-webkit-transition: all 0.3s ease;
					-moz-transition: all 0.3s ease;
					-ms-transition: all 0.3s ease;
					-o-transition: all 0.3s ease;
					transition: all 0.3s ease;

					&.is-expanded {
						transform: rotate(-180deg);
						-webkit-transform: rotate(-180deg);
						-moz-transform: rotate(-180deg);
						-ms-transform: rotate(-180deg);
						-o-transform: rotate(-180deg);
						transition: rotateZ(-180deg);
					}
				}
				.button {
					border: none;
					background: transparent;
				}
			}
		}

		// .header-title {
		// 	position: relative;
		// 	cursor: grab;

		// 	.close-button {
		// 		position: absolute;
		// 		top: 5px;
		// 		right: 5px;
		// 	}
		// }

		.layer-header-buttons {
			margin-left: auto;
		}

		.legend-contents {
			width: fit-content;
			min-width: 200px;
			max-width: 350px;
			max-height: 55vh;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}

	.is-active {
		display: block;
	}
</style>
