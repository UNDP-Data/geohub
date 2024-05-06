<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import LayerOrderPanelButton from '$components/pages/map/layers/order/LayerOrderPanelButton.svelte';
	import RasterSimpleLayer from '$components/pages/map/layers/raster/RasterSimpleLayer.svelte';
	import VectorSimpleLayer from '$components/pages/map/layers/vector/VectorSimpleLayer.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { getLayerStyle } from '$lib/helper';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		LAYERLISTSTORE_CONTEXT_KEY,
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		createLegendReadonlyStore,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type LayerListStore,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import {
		ModalNotification,
		Notification,
		initTooltipTippy
	} from '@undp-data/svelte-undp-components';
	import { getContext, onMount, setContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);

	const legendReadonly: LegendReadonlyStore = createLegendReadonlyStore();
	$legendReadonly = true;
	setContext(LEGEND_READONLY_CONTEXT_KEY, legendReadonly);

	export let contentHeight: number;
	export let activeTab: TabNames;

	let config: UserConfig = $page.data.config;

	$: isDevMode = $page.url.searchParams.get('dev')?.toLowerCase() === 'true' ? true : false;

	const tippyTooltip = initTooltipTippy();
	let layerHeaderHeight = 39;

	$: totalHeight = contentHeight - layerHeaderHeight;

	const handleExploreDatasets = () => {
		activeTab = TabNames.DATA;
		const url = $page.url;
		url.searchParams.set('activetab', activeTab);
		replaceState(url, '');
	};

	let isDeleteDialogVisible = false;
	const openDeleteDialog = () => {
		isDeleteDialogVisible = true;
	};
	const handleDeleteAll = async () => {
		for (const layer of $layerListStore) {
			const delSourceId = getLayerStyle($map, layer.id).source;
			if (layer.children && layer.children.length > 0) {
				layer.children.forEach((child) => {
					if ($map.getLayer(child.id)) {
						$map.removeLayer(child.id);
					}
				});
				layer.children = [];
			}
			if ($map.getLayer(layer.id)) {
				$map.removeLayer(layer.id);
			}
			const layerListforDelSource = $layerListStore.filter(
				(item) => getLayerStyle($map, item.id)?.source === delSourceId
			);
			if (layerListforDelSource.length === 0) {
				$map.removeSource(delSourceId);
			}
		}

		$editingMenuShownStore = false;
		editingLayerStore.set(undefined);

		$layerListStore = [];

		isDeleteDialogVisible = false;
	};

	const handleCancel = () => {
		isDeleteDialogVisible = false;
	};

	const handleLayerToggled = (e) => {
		const layerId = e.detail.layerId;
		const isExpanded = e.detail.isExpanded;
		layerListStore.setIsExpanded(layerId, isExpanded);
	};

	const expandAllDisabled = () => {
		if ($layerListStore.length === 0) return true;
		return $layerListStore.filter((l) => l.isExpanded === true)?.length === $layerListStore.length;
	};

	const collapseAllDisabled = () => {
		if ($layerListStore.length === 0) return true;
		return $layerListStore.filter((l) => l.isExpanded === false)?.length === $layerListStore.length;
	};

	const handleExpandAll = () => {
		if ($layerListStore.length === 0) return;
		$layerListStore?.forEach((l) => {
			l.isExpanded = true;
		});
		$layerListStore = [...$layerListStore];
	};

	const handleCollapseAll = () => {
		if ($layerListStore.length === 0) return;
		$layerListStore?.forEach((l) => {
			l.isExpanded = false;
		});
		$layerListStore = [...$layerListStore];
	};

	const enableDevMode = () => {
		if (!$map) return;
		let devmode = isDevMode === true ? true : config.MaplibreDevMode;
		$map.showTileBoundaries = devmode;
		$map.showCollisionBoxes = devmode;
	};

	onMount(() => {
		enableDevMode();
	});
</script>

{#if $layerListStore?.length > 0}
	<div
		class="is-flex is-align-items-center layer-header pt-2 px-4"
		bind:clientHeight={layerHeaderHeight}
	>
		<div class="layer-header-buttons buttons mb-0">
			{#key $layerListStore}
				<button
					class="button m-0 px-4"
					disabled={expandAllDisabled()}
					on:click={handleExpandAll}
					use:tippyTooltip={{ content: 'Expand all layers' }}
				>
					<span class="icon">
						<span class="material-icons"> expand </span>
					</span>
				</button>

				<button
					class="button m-0 px-4"
					disabled={collapseAllDisabled()}
					use:tippyTooltip={{ content: 'Collapse all layers' }}
					on:click={handleCollapseAll}
				>
					<span class="icon">
						<span class="material-icons"> compress </span>
					</span>
				</button>

				{#if $layerListStore?.length > 1}
					<LayerOrderPanelButton />
				{/if}

				<button
					class="button m-0 px-4"
					disabled={$layerListStore?.length === 0}
					use:tippyTooltip={{ content: 'Delete all layers' }}
					on:click={openDeleteDialog}
				>
					<span class="icon">
						<span class="material-icons"> layers_clear </span>
					</span>
				</button>
			{/key}
		</div>
	</div>
{/if}
<div class="layer-list pb-4" style="height: {totalHeight}px;">
	{#if $layerListStore?.length === 0}
		<div class="p-2">
			<Notification type="info" showCloseButton={false}>
				No layers have been selected. Please select a layer from the <strong>{TabNames.DATA}</strong
				> tab.
			</Notification>
			<div class="is-flex is-justify-content-center">
				<button
					class="button is-primary mt-2 has-text-weight-bold is-uppercase"
					on:click={handleExploreDatasets}
				>
					<span>Explore datasets</span>
				</button>
			</div>
		</div>
	{/if}

	{#each $layerListStore as layer (layer.id)}
		{@const props = layer.dataset?.properties}
		{#if props}
			{#if props.is_raster}
				<RasterSimpleLayer
					{layer}
					bind:isExpanded={layer.isExpanded}
					on:toggled={handleLayerToggled}
					showEditButton={true}
				/>
			{:else}
				<VectorSimpleLayer
					{layer}
					bind:isExpanded={layer.isExpanded}
					on:toggled={handleLayerToggled}
					showEditButton={true}
				/>
			{/if}
		{/if}
	{/each}
</div>

<ModalNotification
	bind:dialogOpen={isDeleteDialogVisible}
	on:cancel={handleCancel}
	on:continue={handleDeleteAll}
	target={$layerListStore.map((l) => l.name).join(', ')}
	title="Delete all layers"
	message="Are you sure you want to delete the all following layers?"
	cancelText="Cancel"
	continueText="Delete all"
/>

<style lang="scss">
	.layer-header {
		width: 100%;

		.layer-header-buttons {
			margin-left: auto;
			width: fit-content;

			button {
				border: none;
				outline: none;
				appearance: none;
				box-shadow: none;
			}
		}

		.button:disabled {
			cursor: not-allowed;
		}
	}

	.layer-list {
		overflow-y: auto;
	}
</style>
