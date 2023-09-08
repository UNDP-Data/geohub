<script lang="ts">
	import DeleteMenu from '$components/controls/DeleteMenu.svelte';
	import Legend from '$components/controls/vector-styles/Legend.svelte';
	import { clean, getLayerStyle, handleEnterKey, initTippy } from '$lib/helper';
	import type { Layer, RasterTileMetadata, VectorTileMetadata } from '$lib/types';
	import { layerList, map } from '$stores';
	import { cloneDeep } from 'lodash-es';
	import type { LayerSpecification, LngLatBoundsLike } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import DataCardInfo from './data-view/DataCardInfo.svelte';

	export let layer: Layer;
	export let isVisible = true;

	let isDeleteDialogVisible = false;

	let layerStyle: LayerSpecification;

	onMount(() => {
		if (!$map) return;
		layerStyle = getLayerStyle($map, layer.id);
	});

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	$: visibility = getVisibility();

	const getVisibility = (): 'visible' | 'none' => {
		const layerStyle = $map.getStyle().layers.find((l) => l.id === layer.id);
		let visibility: 'visible' | 'none' = 'visible';
		if (layerStyle.layout && layerStyle.layout.visibility) {
			visibility = layerStyle.layout.visibility;
		}
		return visibility;
	};

	const toggleVisibility = () => {
		visibility = visibility === 'visible' ? 'none' : 'visible';
		const id = layer.id;
		map.setLayoutProperty(id, 'visibility', visibility);

		const layerClone = cloneDeep(layer);
		const layerIndex = $layerList.findIndex((layer) => layer.id === id);
		$layerList[layerIndex] = layerClone;

		if (layer.children && layer.children.length > 0) {
			layer.children.forEach((child) => {
				if (!$map.getLayer(child.id)) return;
				map.setLayoutProperty(child.id, 'visibility', visibility);
			});
		}
	};

	const handleZoomToLayer = () => {
		let bounds: LngLatBoundsLike;
		const layerStyle = getLayerStyle($map, layer.id);
		if (layerStyle.type === 'raster') {
			const metadata: RasterTileMetadata = layer.info as RasterTileMetadata;
			bounds = [
				[Number(metadata.bounds[0]), Number(metadata.bounds[1])],
				[Number(metadata.bounds[2]), Number(metadata.bounds[3])]
			];
		} else {
			const metadata: VectorTileMetadata = layer.info as VectorTileMetadata;
			const boundsArray = metadata.bounds.split(',');
			bounds = [
				[Number(boundsArray[0]), Number(boundsArray[1])],
				[Number(boundsArray[2]), Number(boundsArray[3])]
			];
		}
		$map.fitBounds(bounds);
	};
</script>

<div class="layer-header m-1 p-2 bottom-border">
	<button
		class="button toggle-button"
		on:click={() => {
			isVisible = !isVisible;
		}}
	>
		<span class="icon has-text-primary">
			<i class="fa-solid fa-chevron-{isVisible ? 'up' : 'down'} fa-xl"></i>
		</span>
	</button>

	<div class="tile is-vertical">
		<div class="tile m-1">
			<Legend bind:map={$map} bind:layer={layerStyle} />

			<span class="layer-name has-text-weight-bold is-size-5 pl-1">
				{clean(layer.name)}
			</span>
		</div>
		<div class="tile">
			<div class="tile right-border">
				<div
					class="operation-button"
					aria-label="Change layer visibility"
					tabindex="0"
					role="button"
					on:click={() => toggleVisibility()}
					on:keydown={handleEnterKey}
				>
					<span class="icon-text">
						<span class="icon">
							<i class="fa-solid {visibility === 'visible' ? 'fa-eye' : 'fa-eye-slash'}" />
						</span>
						<span>{visibility === 'visible' ? 'Hide' : 'Show'}</span>
					</span>
				</div>
			</div>
			<div class="tile right-border">
				<div
					class="operation-button"
					aria-label="Zoom to layer"
					tabindex="0"
					role="button"
					on:click={handleZoomToLayer}
					on:keydown={handleEnterKey}
				>
					<span class="icon-text">
						<span class="icon">
							<i class="fa-solid fa-magnifying-glass-plus"></i>
						</span>
						<span>Zoom</span>
					</span>
				</div>
			</div>
			<div class="tile">
				<div
					class="operation-button"
					aria-label="Show layer metadata"
					tabindex="0"
					role="button"
					use:tippy={{ content: tooltipContent }}
				>
					<span class="icon-text">
						<span class="icon">
							<i class="fa-solid fa-circle-info"></i>
						</span>
						<span>Metadata</span>
					</span>
				</div>
			</div>
		</div>
	</div>

	<button
		class="delete is-medium delete-layer-button"
		on:click={() => {
			isDeleteDialogVisible = true;
		}}
	></button>
</div>
<slot />

<DeleteMenu bind:layer bind:isVisible={isDeleteDialogVisible} />

<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
	<button class="delete close"></button>

	<div class="data-card">
		<DataCardInfo bind:feature={layer.dataset} bind:metadata={layer.info} />
	</div>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.tooltip {
		width: 300px;
		inset: -10px auto auto 0px !important;

		.close {
			position: absolute;
			top: 5px;
			right: 5px;
			z-index: 10;
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

	.layer-header {
		position: relative;
		display: flex;
		align-items: center;

		.layer-name {
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			display: -webkit-box;
			overflow: hidden;
			text-overflow: ellipsis;
			justify-content: left;
		}

		.toggle-button {
			border: none;
			background: transparent;
		}

		.operation-button {
			cursor: pointer;
			margin-left: auto;
			margin-right: auto;

			:hover {
				background-color: rgb(239, 239, 239);
			}
		}

		.delete-layer-button {
			position: absolute;
			top: -5px;
			right: -12px;
		}
	}

	.bottom-border {
		border-bottom: 1px solid #b5b5b5;
	}

	.right-border {
		border-right: 1px solid #b5b5b5;
	}
</style>
