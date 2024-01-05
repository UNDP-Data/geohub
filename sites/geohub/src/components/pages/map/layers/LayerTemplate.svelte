<script lang="ts">
	import Accordion from '$components/util/Accordion.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { clean, getLayerStyle, handleEnterKey, initTippy, initTooltipTippy } from '$lib/helper';
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
	import VisibilityButton from './header/VisibilityButton.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let showEditButton = false;

	if (!('isExpanded' in layer)) {
		layer.isExpanded = true;
	}

	export let isExpanded = layer.isExpanded;
	let isDeleteDialogVisible = false;

	const accessLevel = layer.dataset.properties.access_level ?? AccessLevel.PUBLIC;

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

	const tippyTooltip = initTooltipTippy();

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

<Accordion title={clean(layer.name)} bind:isExpanded>
	<div class="is-flex is-align-items-center" slot="buttons">
		{#if accessLevel !== AccessLevel.PUBLIC}
			<div
				class="menu-button p-0 px-1"
				use:tippyTooltip={{
					content: `This dataset has limited data accesibility. It only has ${
						accessLevel === AccessLevel.PRIVATE ? 'private' : 'organisation'
					} access.`
				}}
			>
				<span class="icon is-small">
					<i class="fa-solid fa-circle-exclamation has-text-grey-dark"></i>
				</span>
			</div>
		{/if}

		{#if showEditButton}
			<button
				class="button menu-button hidden-mobile p-0 px-2 ml-1"
				on:click={handleEditLayer}
				disabled={($editingLayerStore && $editingLayerStore.id !== layer.id) ?? false}
				use:tippyTooltip={{ content: 'Edit the settings on how the layer is visualised.' }}
			>
				<span class="icon is-small">
					<i class="fa-solid fa-sliders has-text-grey-dark"></i>
				</span>
			</button>
		{/if}

		<VisibilityButton {layer} />

		<div class="dropdown-trigger">
			<button
				class="button menu-button menu-button-{layer.id} p-0 px-2 ml-1"
				use:tippy={{ content: tooltipContent }}
			>
				<span class="icon is-small">
					<i class="fas fa-ellipsis has-text-grey-dark" aria-hidden="true"></i>
				</span>
			</button>
		</div>
	</div>
	<div slot="content">
		{#key isLayerChanged}
			<slot name="content" />
		{/key}
	</div>
</Accordion>

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
		<DataCardInfoMenu bind:layer />
	</div>
</div>
{#if showEditButton}
	<DeleteMenu bind:layer bind:isVisible={isDeleteDialogVisible} on:delete={handleDeleted} />
{/if}

<style lang="scss">
	.border {
		border-bottom: 1px #d4d6d8 solid;
	}

	.menu-button {
		border: none;
		background: transparent;
		cursor: pointer;
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
