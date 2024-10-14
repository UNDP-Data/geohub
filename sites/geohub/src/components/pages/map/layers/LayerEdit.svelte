<script lang="ts">
	import { getLayerStyle } from '$lib/helper';
	import type { RasterTileMetadata, VectorTileMetadata } from '$lib/types';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		TABLE_MENU_SHOWN_CONTEXT_KEY,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type MapStore
	} from '$stores';
	import { layerTypes } from '@undp-data/svelte-maplibre-storymap';
	import {
		FloatingPanel,
		initTippy,
		initTooltipTippy,
		Slider
	} from '@undp-data/svelte-undp-components';
	import type { LngLatBoundsLike } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';
	import RasterLayer from './raster/RasterLayer.svelte';
	import VectorLayer from './vector/VectorLayer.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);
	const tableMenuShownStore: EditingMenuShownStore = getContext(TABLE_MENU_SHOWN_CONTEXT_KEY);

	let vectorSourceLayer: string | undefined = undefined;
	let layerOpacity = 1;

	const tippy = initTippy({});
	const tippyTooltip = initTooltipTippy();
	let tooltipContent: HTMLElement;

	const getLayerOpacity = () => {
		if (!map) return 0;
		const style = $map.getStyle();
		const layer = style?.layers?.find((l) => l.id === $editingLayerStore?.id);
		if (!layer) return 0;

		if (layer.layout?.visibility === 'none') {
			return 0;
		}

		if (layer.type === 'hillshade') {
			return 1;
		}

		let opacity = 0;

		const props: string[] = layerTypes[layer.type];
		if (props && props.length > 0) {
			for (const prop of props) {
				const v = layer.paint[prop];
				opacity = v ?? 1;
			}
		}

		return opacity;
	};

	const handleClose = () => {
		$editingMenuShownStore = false;
		$tableMenuShownStore = false;
		$editingLayerStore = undefined;
	};

	const handleShowTable = () => {
		$tableMenuShownStore = !$tableMenuShownStore;
	};

	const updateOpacity = (opacity: number) => {
		if (!$editingLayerStore) return;
		const visibility = opacity === 0 ? 'none' : 'visible';
		const layerId = $editingLayerStore.id as string;
		const mapLayer = $map.getLayer(layerId);
		const props: string[] = layerTypes[mapLayer.type];

		if ($editingLayerStore.children && $editingLayerStore.children.length > 0) {
			$editingLayerStore.children.forEach((child) => {
				const childLayer = $map.getLayer(child.id);
				if (!childLayer) return;
				const childProps: string[] = layerTypes[childLayer.type];
				if (childProps && childProps.length > 0) {
					childProps.forEach((prop) => {
						map.setPaintProperty(child.id, prop, opacity);
					});
				}
				map.setLayoutProperty(child.id, 'visibility', visibility);
			});
		}

		if (props && props.length > 0) {
			props.forEach((prop) => {
				map.setPaintProperty(layerId, prop, opacity);
			});
		}
		map.setLayoutProperty(layerId, 'visibility', visibility);
	};

	const handleOpacityChanged = (e: { detail: { values: number[] } }) => {
		const values = e.detail.values;
		const opacity = values[0] / 100;
		updateOpacity(opacity);
	};

	const handleVisibilityChanged = () => {
		const opacity = layerOpacity === 0 ? 1 : 0;
		updateOpacity(opacity);
	};

	const handleZoomToLayer = () => {
		if (!$editingLayerStore) return;

		let bounds: LngLatBoundsLike | undefined = undefined;
		const layerStyle = getLayerStyle($map, $editingLayerStore.id);
		if (['raster', 'hillshade'].includes(layerStyle.type)) {
			const metadata: RasterTileMetadata = $editingLayerStore.info as RasterTileMetadata;
			if (metadata.bounds) {
				bounds = [
					[Number(metadata.bounds[0]), Number(metadata.bounds[1])],
					[Number(metadata.bounds[2]), Number(metadata.bounds[3])]
				];
			}
		} else {
			const metadata: VectorTileMetadata = $editingLayerStore.info as VectorTileMetadata;
			const boundsArray = metadata.bounds.split(',');
			bounds = [
				[Number(boundsArray[0]), Number(boundsArray[1])],
				[Number(boundsArray[2]), Number(boundsArray[3])]
			];
		}
		if (bounds) {
			$map.fitBounds(bounds);
		}
	};

	onMount(() => {
		if (!$editingLayerStore) return;
		layerOpacity = getLayerOpacity();

		const fgbUrls = $editingLayerStore.dataset?.properties.links?.filter((l) =>
			l.rel.startsWith('flatgeobuf')
		);
		if (fgbUrls && fgbUrls.length > 0) {
			const mapLayer = $map.getLayer($editingLayerStore.id);
			vectorSourceLayer = mapLayer?.sourceLayer;
		}

		$map.on('styledata', () => {
			layerOpacity = getLayerOpacity();
		});
	});
</script>

{#if $editingLayerStore}
	<div class="layer-editor">
		<FloatingPanel title={$editingLayerStore.name} on:close={handleClose}>
			<div class="field has-addons" style="border-bottom: 1px solid #EDEFF0;">
				<p class="control">
					<button
						class="button menu-button"
						on:click={handleZoomToLayer}
						use:tippyTooltip={{
							content: `Zoom to layer`
						}}
					>
						<span class="icon is-small">
							<span class="material-symbols-outlined"> zoom_in_map </span>
						</span>
					</button>
				</p>
				{#if vectorSourceLayer}
					<p class="control">
						<button
							class="button menu-button"
							on:click={handleShowTable}
							use:tippyTooltip={{
								content: `${$tableMenuShownStore === true ? 'Hide' : 'Show'} table`
							}}
						>
							<span class="icon is-small">
								<span class="material-symbols-outlined"> table </span>
							</span>
						</button>
					</p>
				{/if}
				<p class="control">
					<button
						class="button menu-button"
						on:click={handleVisibilityChanged}
						use:tippyTooltip={{
							content: `Change layer visibility`
						}}
					>
						<span class="icon is-small">
							{#if layerOpacity === 0}
								<span class="material-symbols-outlined"> visibility_off </span>
							{:else}
								<span class="material-symbols-outlined"> visibility </span>
							{/if}
						</span>
					</button>
				</p>
				<div class="control">
					<div
						class="button menu-button opacity-control is-flex is-align-items-center p-1"
						use:tippy={{ content: tooltipContent }}
						use:tippyTooltip={{ content: 'Change opacity (0-100%)' }}
					>
						<span class="material-symbols-outlined opacity-icon"> opacity </span>
						<span class="opacity-value ml-auto">{`${(layerOpacity * 100).toFixed(0)}`}%</span>
					</div>

					<div class="opacity-popup" bind:this={tooltipContent}>
						<Slider
							min={0}
							max={100}
							values={[layerOpacity * 100]}
							step={1}
							rest={false}
							pips={true}
							suffix="%"
							on:change={handleOpacityChanged}
						/>
					</div>
				</div>
			</div>

			{#if $editingLayerStore.dataset?.properties.is_raster === true}
				<RasterLayer bind:layer={$editingLayerStore} />
			{:else}
				<VectorLayer bind:layer={$editingLayerStore} />
			{/if}
		</FloatingPanel>
	</div>
{/if}

<style lang="scss">
	.layer-editor {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 350px;

		z-index: 20;

		.opacity-control {
			cursor: pointer;
			width: 65px;
			height: 38px;

			.opacity-icon {
				font-size: 24px;
			}

			.opacity-value {
				color: #55606e;
				font-size: 12px;
			}
		}

		.opacity-popup {
			width: 200px;
		}

		.menu-button {
			&.button {
				border: none;
				box-shadow: none;
			}
		}
	}
</style>
