<script lang="ts">
	import { AccessLevel } from '$lib/config/AppConfig';
	import { getLayerStyle } from '$lib/helper';
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
	import {
		Accordion,
		clean,
		FieldControl,
		handleEnterKey,
		initTooltipTippy,
		ModalNotification,
		ModalTemplate,
		OpacityEditor
	} from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import type { LngLatBoundsLike } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layer: Layer;
	export let showEditButton = false;

	let showDropdown = false;
	let showRenameDialog = false;
	let inputLayerTitle = layer.name;

	let layerOpacity = 1;

	if (!('isExpanded' in layer)) {
		layer.isExpanded = true;
	}

	export let isExpanded = layer.isExpanded;
	let isDeleteDialogVisible = false;

	const accessLevel = layer.dataset?.properties.access_level ?? AccessLevel.PUBLIC;
	const existLayerInMap = $map.getStyle().layers.find((l) => l.id === layer.id) ? true : false;

	const tippyTooltip = initTooltipTippy();

	const handleZoomToLayer = () => {
		clickMenuButton();
		let bounds: LngLatBoundsLike;
		const layerStyle = getLayerStyle($map, layer.id);
		if (['raster', 'hillshade'].includes(layerStyle.type)) {
			const metadata: RasterTileMetadata = layer.info as RasterTileMetadata;
			if (metadata.bounds) {
				bounds = [
					[Number(metadata.bounds[0]), Number(metadata.bounds[1])],
					[Number(metadata.bounds[2]), Number(metadata.bounds[3])]
				];
			}
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
		if ($editingMenuShownStore === true && $editingLayerStore?.id !== layer.id) {
			// open layer editor with different layer
			$editingMenuShownStore = false;
			$map.off('styledata', handleLayerStyleChanged);
			editingLayerStore.set(undefined);

			setTimeout(() => {
				$editingMenuShownStore = true;
				editingLayerStore.set(layer);
				$map.on('styledata', handleLayerStyleChanged);
			}, 300);
		} else {
			// open new layer editor or close it
			$editingMenuShownStore = !$editingMenuShownStore;

			if (!$editingMenuShownStore) {
				$map.off('styledata', handleLayerStyleChanged);
				editingLayerStore.set(undefined);
			} else {
				editingLayerStore.set(layer);
				$map.on('styledata', handleLayerStyleChanged);
			}
		}
	};

	const handleDeleted = () => {
		const layerId = layer.id;
		isDeleteDialogVisible = false;

		setTimeout(() => {
			const layer = $layerListStore.filter((item) => item.id === layerId)[0];
			const delSourceId = getLayerStyle($map, layer.id).source;
			if (layer.children && layer.children.length > 0) {
				layer.children.forEach((child) => {
					if ($map.getLayer(child.id)) {
						$map.removeLayer(child.id);
					}
				});
				layer.children = [];
			}
			$layerListStore = $layerListStore.filter((item) => item.id !== layerId);
			if ($map.getLayer(layerId)) {
				$map.removeLayer(layerId);
			}
			const layerListforDelSource = $layerListStore.filter(
				(item) => getLayerStyle($map, item.id).source === delSourceId
			);
			if (layerListforDelSource.length === 0) {
				$map.removeSource(delSourceId);
			}

			$editingMenuShownStore = false;
			editingLayerStore.set(undefined);
		}, 200);
	};

	const getLayerOpacity = () => {
		if (!$map) return 1;
		const style = $map.getStyle();
		const layerStyle = style?.layers?.find((l) => l.id === layer.id);
		if (!layerStyle) return 1;

		if (layerStyle.layout?.visibility === 'none') {
			return 0;
		}
		return 1;
	};

	const handleVisiblityChagned = (e: { detail: { opacity: number } }) => {
		const opacity = e.detail.opacity;
		const visibility = opacity === 0 ? 'none' : 'visible';

		$map.setLayoutProperty(layer.id, 'visibility', visibility);

		if (layer.children && layer.children.length > 0) {
			layer.children.forEach((child) => {
				const childLayer = $map.getLayer(child.id);
				if (!childLayer) return;
				map.setLayoutProperty(child.id, 'visibility', visibility);
			});
		}
	};

	const handleLayerNameDialogOpened = () => {
		$editingMenuShownStore = false;
		editingLayerStore.set(undefined);

		inputLayerTitle = layer.name;
		showRenameDialog = true;
	};

	const handleLayerNameChanged = () => {
		layer.name = inputLayerTitle.trim();
		showRenameDialog = false;
	};

	onMount(() => {
		layerOpacity = getLayerOpacity();
	});
</script>

<Accordion
	title={clean(layer.name)}
	bind:isExpanded
	isSelected={$editingLayerStore?.id === layer.id}
	showHoveredColor={true}
>
	<div class="accordion-content is-flex is-align-items-center" slot="buttons">
		{#if accessLevel !== AccessLevel.PUBLIC}
			<div
				class="button menu-button pl-2 pr-3 py-0"
				use:tippyTooltip={{
					content: `This dataset has limited data accesibility. It only has ${
						accessLevel === AccessLevel.PRIVATE ? 'private' : 'organisation'
					} access.`
				}}
			>
				<span class="icon is-small">
					<span class="icon is-small material-symbols-outlined header-icon"> info </span>
				</span>
			</div>
		{/if}

		{#if existLayerInMap}
			{#if showEditButton}
				<button
					class="button menu-button hidden-mobile px-3 py-0"
					on:click={handleEditLayer}
					use:tippyTooltip={{ content: 'Edit the settings on how the layer is visualised.' }}
				>
					<span class="icon is-small material-symbols-outlined header-icon"> tune </span>
				</button>
			{/if}

			<OpacityEditor
				bind:opacity={layerOpacity}
				showOpacity={false}
				on:change={handleVisiblityChagned}
			/>

			<div
				role="button"
				tabindex="0"
				class="download-dropdown dropdown is-right {showDropdown ? 'is-active' : ''}"
				on:mouseenter={() => {
					showDropdown = true;
				}}
				on:mouseleave={() => {
					showDropdown = false;
				}}
			>
				<div class="dropdown-trigger">
					<button
						class="button menu-button menu-button-{layer.id} pl-3 pr-0 py-0"
						aria-haspopup="true"
						aria-controls="dropdown-menu"
						on:click={() => {
							showDropdown = !showDropdown;
						}}
					>
						<span class="icon is-small material-symbols-outlined header-icon"> more_horiz </span>
					</button>
				</div>
				<div class="dropdown-menu" id="dropdown-menu" role="menu">
					<div class="dropdown-content">
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class="dropdown-item"
							role="button"
							tabindex="0"
							on:click={handleZoomToLayer}
							on:keydown={handleEnterKey}
						>
							<span class="is-flex">
								<span class="icon mr-2 material-symbols-outlined"> zoom_in_map </span>
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
							<span class="is-flex">
								<span class="icon mr-2 material-symbols-outlined"> visibility </span>
								<span>Show only this layer</span>
							</span>
						</a>
						{#if showEditButton}
							<!-- svelte-ignore a11y-missing-attribute -->
							<a
								class="dropdown-item"
								role="button"
								tabindex="0"
								on:click={handleLayerNameDialogOpened}
								on:keydown={handleEnterKey}
							>
								<span class="is-flex">
									<span class="icon mr-2 material-symbols-outlined"> edit </span>
									<span>Rename layer title</span>
								</span>
							</a>

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
								<span class="is-flex">
									<span class="icon mr-2 material-symbols-outlined"> delete </span>
									<span>Delete layer</span>
								</span>
							</a>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
	<div slot="content">
		{#key isLayerChanged}
			<slot name="content" />
		{/key}
	</div>
</Accordion>

{#if existLayerInMap}
	{#if showEditButton}
		{#if isDeleteDialogVisible}
			<ModalNotification
				bind:dialogOpen={isDeleteDialogVisible}
				on:cancel={() => {
					isDeleteDialogVisible = false;
				}}
				on:continue={handleDeleted}
				title="Delete Layer"
				message="Are you sure you want to delete this layer?"
				target={clean(layer.name)}
				cancelText="Cancel"
				continueText="Delete"
			/>
		{/if}

		{#if showRenameDialog}
			<ModalTemplate title="Rename layer title" bind:show={showRenameDialog}>
				<div slot="content">
					<FieldControl title="Layer title" showHelp={false}>
						<div slot="control">
							<input
								class="input {inputLayerTitle.trim().length === 0 ? 'is-danger' : ''}"
								type="text"
								placeholder="Add layer title"
								bind:value={inputLayerTitle}
							/>
							{#if inputLayerTitle.trim().length === 0}
								<span class="help is-danger"> Please name this layer. </span>
							{/if}
						</div>
					</FieldControl>
				</div>
				<div slot="buttons">
					<button
						class="button is-link is-uppercase has-text-weight-bold"
						disabled={inputLayerTitle.length === 0 || inputLayerTitle === layer.name}
						on:click={handleLayerNameChanged}
					>
						apply
					</button>
				</div>
			</ModalTemplate>
		{/if}
	{/if}
{/if}

<style lang="scss">
	.hidden-mobile {
		display: block;
		@media (max-width: 48em) {
			display: none;
		}
	}

	.dropdown-content {
		width: fit-content;
	}

	.accordion-content {
		.menu-button {
			border: none;
			background: transparent;
			cursor: pointer;
			box-shadow: none;
		}

		:global(.visibility-icon) {
			font-size: 20px !important;
		}

		.header-icon {
			font-size: 20px;
		}
	}
</style>
