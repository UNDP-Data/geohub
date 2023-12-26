<script lang="ts">
	import { AccessLevel } from '$lib/config/AppConfig';
	import { clean, getAccessLevelIcon, getLayerStyle, handleEnterKey, initTippy } from '$lib/helper';
	import type { Layer, RasterTileMetadata, VectorTileMetadata } from '$lib/types';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import { debounce } from 'lodash-es';
	import type { LngLatBoundsLike } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';
	import DataCardInfoMenu from './header/DataCardInfoMenu.svelte';
	import DeleteMenu from './header/DeleteMenu.svelte';
	import HistogramMenu from './header/HistogramMenu.svelte';
	import VisibilityButton from './header/VisibilityButton.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let hideToggleButton = false;
	export let showEditButton = false;

	if (!('isExpanded' in layer)) {
		layer.isExpanded = true;
	}

	export let isExpanded = layer.isExpanded;
	let isDeleteDialogVisible = false;

	let is_raster = layer.dataset.properties.is_raster;

	const accessIcon = getAccessLevelIcon(
		layer.dataset.properties.access_level ?? AccessLevel.PUBLIC,
		true
	);

	const tippy = initTippy({
		placement: 'bottom-end',
		arrow: false,
		theme: 'transparent',
		offset: [10, 0],
		onShow(instance) {
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			instance.popper.querySelector('.close')?.removeEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement;

	const handleZoomToLayer = () => {
		clickMenuButton();
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

	const clickMenuButton = () => {
		const buttons = document.getElementsByClassName(`menu-button-${layer.id}`);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const button: HTMLButtonElement = buttons[0];
		button.click();
	};

	$: isExpanded, handleToggleChanged();
	const handleToggleChanged = () => {
		layer.isExpanded = isExpanded;
		dispatch('toggled', {
			layerId: layer.id,
			isExpanded: isExpanded
		});
	};

	const handleShowOnlyThisLayer = () => {
		// show target layer
		map.setLayoutProperty(layer.id, 'visibility', 'visible');
		if (layer.children && layer.children.length > 0) {
			layer.children.forEach((child) => {
				if (!$map.getLayer(child.id)) return;
				map.setLayoutProperty(child.id, 'visibility', 'visible');
			});
		}

		// hide all other layers
		$layerListStore?.forEach((l) => {
			if (layer.id === l.id) return;

			map.setLayoutProperty(l.id, 'visibility', 'none');

			if (l.children && l.children.length > 0) {
				l.children.forEach((child) => {
					if (!$map.getLayer(child.id)) return;
					map.setLayoutProperty(child.id, 'visibility', 'none');
				});
			}
		});
	};

	let isLayerChanged = false;

	const handleLayerStyleChanged = debounce(() => {
		if (!$editingLayerStore) return;
		if ($editingLayerStore.id !== layer.id) return;
		isLayerChanged = !isLayerChanged;
	}, 300);

	const handleEditLayer = () => {
		$editingMenuShownStore = !$editingMenuShownStore;

		if (!$editingMenuShownStore) {
			$map.off('styledata', handleLayerStyleChanged);
			editingLayerStore.set(undefined);
		} else {
			editingLayerStore.set(layer);
			$map.on('styledata', handleLayerStyleChanged);
		}
	};

	const handleDeleted = () => {
		$editingMenuShownStore = false;
		editingLayerStore.set(undefined);
	};
</script>

<article class="is-flex is-flex-direction-column border">
	<div class="header is-flex pl-2 py-4">
		<div
			class="layer-header is-flex is-align-items-center pr-2 {!hideToggleButton ? 'toggle' : ''}"
			role="button"
			tabindex="0"
			on:keydown={handleEnterKey}
			on:click={() => {
				if (hideToggleButton) return;
				isExpanded = !isExpanded;
			}}
		>
			{#if !hideToggleButton}
				<div class="toggle-button icon has-text-primary mr-3">
					<i class="fa-solid fa-chevron-{isExpanded ? 'up' : 'down'} fa-xl"></i>
				</div>
			{/if}

			{#if accessIcon}
				<i class="{accessIcon} fa-2xl px-2" />
			{/if}

			<span class="layer-name has-text-weight-bold is-size-6 pl-1">
				{clean(layer.name)}
			</span>
		</div>

		<div class="is-flex is-align-items-center">
			{#if showEditButton}
				<button
					class="button menu-button hidden-mobile"
					on:click={handleEditLayer}
					disabled={($editingLayerStore && $editingLayerStore.id !== layer.id) ?? false}
				>
					<span class="icon is-small">
						<i class="fa-solid fa-pen-to-square fa-xl"></i>
					</span>
				</button>
			{/if}

			<VisibilityButton {layer} />

			<div class="dropdown-trigger">
				<button
					class="button menu-button menu-button-{layer.id}"
					use:tippy={{ content: tooltipContent }}
				>
					<span class="icon is-small">
						<i class="fas fa-ellipsis-vertical fa-xl" aria-hidden="true"></i>
					</span>
				</button>
			</div>
		</div>
	</div>
	<div class="has-text-dark pb-2" hidden={hideToggleButton === true ? false : !isExpanded}>
		{#key isLayerChanged}
			<slot name="content" />
		{/key}
	</div>
</article>

<div role="menu" bind:this={tooltipContent}>
	<div class="dropdown-content">
		<!-- svelte-ignore a11y-missing-attribute -->
		<a
			class="dropdown-item"
			role="button"
			tabindex="0"
			on:click={handleZoomToLayer}
			on:keydown={handleEnterKey}
		>
			<span class="icon-text">
				<span class="icon">
					<i class="fa-solid fa-magnifying-glass-plus"></i>
				</span>
				<span>Zoom to layer</span>
			</span>
		</a>

		<!-- svelte-ignore a11y-missing-attribute -->
		<a
			class="dropdown-item"
			role="button"
			tabindex="0"
			on:click={handleShowOnlyThisLayer}
			on:keydown={handleEnterKey}
		>
			<span class="icon-text">
				<span class="icon">
					<i class="fa-solid fa-eye"></i>
				</span>
				<span>Show only this layer</span>
			</span>
		</a>
		{#if showEditButton}
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				class="dropdown-item"
				role="button"
				tabindex="0"
				on:click={() => {
					clickMenuButton();
					isDeleteDialogVisible = true;
				}}
				on:keydown={handleEnterKey}
			>
				<span class="icon-text">
					<span class="icon">
						<i class="fa-solid fa-trash"></i>
					</span>
					<span>Delete layer</span>
				</span>
			</a>
		{/if}

		{#if is_raster}
			<HistogramMenu bind:metadata={layer.info} />
		{/if}

		<DataCardInfoMenu bind:layer />
	</div>
</div>
{#if showEditButton}
	<DeleteMenu bind:layer bind:isVisible={isDeleteDialogVisible} on:delete={handleDeleted} />
{/if}

<style lang="scss">
	.border {
		border-bottom: 1px #7a7a7a solid;
	}

	.menu-button,
	.toggle-button {
		border: none;
		background: transparent;
	}

	.header {
		max-height: 60px;
		.layer-header {
			cursor: default;

			&.toggle {
				cursor: pointer;
			}

			width: 100%;
		}
	}

	.layer-name {
		align-items: center;

		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}

	.hidden-mobile {
		display: block;
		@media (max-width: 48em) {
			display: none;
		}
	}
</style>
