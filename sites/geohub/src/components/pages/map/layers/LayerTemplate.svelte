<script lang="ts">
	import { AccessLevel } from '$lib/config/AppConfig';
	import { getLayerStyle } from '$lib/helper';
	import type { Layer, VectorLayerSpecification } from '$lib/types';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		LAYERLISTSTORE_CONTEXT_KEY,
		TABLE_MENU_SHOWN_CONTEXT_KEY,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type LayerListStore
	} from '$stores';
	import { layerTypes } from '@undp-data/svelte-maplibre-storymap';
	import {
		Accordion,
		clean,
		FieldControl,
		handleEnterKey,
		initTooltipTippy,
		MAPSTORE_CONTEXT_KEY,
		ModalNotification,
		ModalTemplate,
		OpacityEditor,
		type MapStore,
		type RasterTileMetadata,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import type { LngLatBoundsLike, RasterLayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);
	const tableMenuShownStore: EditingMenuShownStore = getContext(TABLE_MENU_SHOWN_CONTEXT_KEY);

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
		$tableMenuShownStore = false;

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

			$tableMenuShownStore = false;
			$editingMenuShownStore = false;
			editingLayerStore.set(undefined);
		}, 200);
	};

	const getLayerOpacity = () => {
		if (!map) return 0;
		const style = $map.getStyle();
		const l = style?.layers?.find((l) => l.id === layer.id);
		if (!l) return 0;

		let invisible = l.layout?.visibility === 'none';
		if (invisible) {
			return 0;
		}

		if (l.type === 'hillshade') {
			return 1;
		}

		let opacity = 0;

		const props: string[] = layerTypes[l.type];
		if (props && props.length > 0) {
			for (const prop of props) {
				if (l.paint && prop in l.paint) {
					const v = l.paint[prop];
					opacity = v;
				}
			}
		}

		if (opacity === 0 && !invisible) {
			opacity = 1;
		}

		return opacity;
	};

	const updateOpacity = (opacity: number) => {
		const visibility = opacity === 0 ? 'none' : 'visible';
		const layerId = layer.id as string;
		const mapLayer = $map.getLayer(layerId);
		const props: string[] = layerTypes[mapLayer.type];

		if (layer.children && layer.children.length > 0) {
			layer.children.forEach((child) => {
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

	const handleVisibilityChanged = () => {
		const opacity = getLayerOpacity();
		layerOpacity = opacity === 0 ? 1 : 0;
		updateOpacity(layerOpacity);
	};

	const handleLayerNameDialogOpened = () => {
		$editingMenuShownStore = false;
		editingLayerStore.set(undefined);

		$tableMenuShownStore = false;
		inputLayerTitle = layer.name;
		showRenameDialog = true;
	};

	const handleLayerNameChanged = () => {
		layer.name = inputLayerTitle.trim();
		showRenameDialog = false;
	};

	const handleDuplicateLayer = () => {
		$tableMenuShownStore = false;
		$editingMenuShownStore = false;
		editingLayerStore.set(undefined);

		const newStyle = $map.getStyle();

		// copied Layer object
		const targetLayer: Layer = JSON.parse(JSON.stringify(layer));
		const sourceId = getLayerStyle($map, layer.id).source;
		const source = newStyle.sources[sourceId];

		let newSourceId = sourceId;

		const mapLayer = getLayerStyle($map, layer.id);
		if (mapLayer) {
			// if it is not PMTiles layer, soruce also needs to be duplicated
			if (['raster', 'hillshade'].includes(mapLayer.type)) {
				// raster
				newSourceId = uuidv4();
			} else {
				// vector
				const dataType = targetLayer.dataset?.properties.tags?.find((t) => t.key === 'type')?.value;
				const layerType = targetLayer.dataset?.properties.tags?.find(
					(t) => t.key === 'layertype'
				)?.value;
				if (dataType === 'pgtileserv' && layerType === 'function') {
					// pg_tileserv function layer
					newSourceId = uuidv4();
				} else {
					// other vector layer reuse same vector source
					newSourceId = sourceId;
				}
			}
		}

		if (newSourceId !== sourceId) {
			// if new source id and old source id are different, add new source
			newStyle.sources[newSourceId] = source;
		}

		if (mapLayer) {
			const oldIndex = newStyle.layers.findIndex((l) => l.id === layer.id);

			// generate new UUID and set to new layer
			mapLayer.id = uuidv4();
			targetLayer.id = mapLayer.id;
			targetLayer.name = `Copied ${targetLayer.name}`;

			// set new source id
			mapLayer.source = newSourceId;
			if (oldIndex === newStyle.layers.length - 1) {
				// if layer is the last, add it to the last
				newStyle.layers.push(mapLayer);
			} else {
				// if not, add layer after current layer
				newStyle.layers.splice(oldIndex + 1, 0, mapLayer);
			}

			// if there are child layer like label
			if (layer.children && layer.children.length > 0) {
				targetLayer.children = [];
				for (let i = 0; i < layer.children.length; i++) {
					// copy child layer
					const child: Layer = JSON.parse(JSON.stringify(layer.children[i]));
					const oldChildIndex = newStyle.layers.findIndex((l) => l.id === child.id);
					const childLayer = getLayerStyle($map, child.id) as
						| VectorLayerSpecification
						| RasterLayerSpecification;
					// generate new UUID and set it to new child layer
					childLayer.id = uuidv4();
					childLayer.source = newSourceId;
					child.id = childLayer.id;
					child.parentId = targetLayer.id;
					child.name = `Copied ${child.name}`;

					// add child layer to new style
					targetLayer.children.push(child);
					if (oldChildIndex === newStyle.layers.length - 1) {
						newStyle.layers.push(childLayer);
					} else {
						newStyle.layers.splice(oldChildIndex + 1, 0, childLayer);
					}
				}
			}
		}

		$map.setStyle(newStyle);

		const currentLayerIndex = $layerListStore.findIndex((item) => item.id === layer.id);
		if (currentLayerIndex === 0) {
			$layerListStore = [targetLayer, ...$layerListStore];
		} else {
			$layerListStore.splice(currentLayerIndex, 0, targetLayer);
			$layerListStore = [...$layerListStore];
		}
	};

	onMount(() => {
		layerOpacity = getLayerOpacity();

		$map.on('styledata', () => {
			layerOpacity = getLayerOpacity();
		});
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
				on:change={handleVisibilityChanged}
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
								<span class="icon mr-2 material-symbols-outlined"> disabled_visible </span>
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
								on:click={handleDuplicateLayer}
								on:keydown={handleEnterKey}
							>
								<span class="is-flex">
									<span class="icon mr-2 material-symbols-outlined"> content_copy </span>
									<span>Duplicate layer</span>
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
