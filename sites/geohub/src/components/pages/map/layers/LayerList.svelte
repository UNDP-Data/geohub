<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import LayerOrderPanelButton from '$components/pages/map/layers/order/LayerOrderPanelButton.svelte';
	import { Permission, TabNames } from '$lib/config/AppConfig';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { getLayerStyle } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import {
		EDITING_LAYER_STORE_CONTEXT_KEY,
		EDITING_MENU_SHOWN_CONTEXT_KEY,
		LAYERLISTSTORE_CONTEXT_KEY,
		PAGE_DATA_LOADING_CONTEXT_KEY,
		TABLE_MENU_SHOWN_CONTEXT_KEY,
		type EditingLayerStore,
		type EditingMenuShownStore,
		type LayerListStore,
		type PageDataLoadingStore
	} from '$stores';
	import {
		initTooltipTippy,
		MAPSTORE_CONTEXT_KEY,
		ModalNotification,
		Notification,
		type MapStore
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import LayerTemplate from './LayerTemplate.svelte';
	import StyleSaveDialog from './StyleSaveDialog.svelte';
	import StyleShareDialog from './StyleShareDialog.svelte';

	const dispatch = createEventDispatcher();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const editingLayerStore: EditingLayerStore = getContext(EDITING_LAYER_STORE_CONTEXT_KEY);
	const editingMenuShownStore: EditingMenuShownStore = getContext(EDITING_MENU_SHOWN_CONTEXT_KEY);
	const tableMenuShownStore: EditingMenuShownStore = getContext(TABLE_MENU_SHOWN_CONTEXT_KEY);
	const pageDataLoadingStore: PageDataLoadingStore = getContext(PAGE_DATA_LOADING_CONTEXT_KEY);

	interface Props {
		contentHeight: number;
		activeTab: TabNames;
	}

	let { contentHeight = $bindable(), activeTab = $bindable() }: Props = $props();

	let config: UserConfig = page.data.config;
	let style: DashboardMapStyle = $state(page.data.style);

	let isDevMode = $derived(
		page.url.searchParams.get('dev')?.toLowerCase() === 'true' ? true : false
	);

	const tippyTooltip = initTooltipTippy();
	let layerHeaderHeight = $state(0);
	let layerFooterHeight = $state(0);

	let totalHeight = $derived(contentHeight - layerHeaderHeight - layerFooterHeight - 30);
	let saveDisabled = $derived($layerListStore.length === 0 || !page.data.session);

	let isNewMapMode = $derived(style ? false : true);

	let showSaveDialog = $state(false);
	let showShareDialog = $state(false);

	let isLayerListChanged = $state(false);

	const handleExploreDatasets = () => {
		activeTab = TabNames.DATA;
		const url = page.url;
		url.searchParams.set('activetab', activeTab);
		replaceState(url, '');
	};

	let isDeleteDialogVisible = $state(false);
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

		$tableMenuShownStore = false;
		$editingMenuShownStore = false;
		editingLayerStore.set(undefined);

		$layerListStore = [];

		isDeleteDialogVisible = false;
	};

	const handleCancel = () => {
		isDeleteDialogVisible = false;
	};

	const handleLayerToggled = (layerId: string, isExpanded: boolean) => {
		layerListStore.setIsExpanded(layerId, isExpanded);
	};

	const handleLayerListChanged = () => {
		isLayerListChanged = !isLayerListChanged;
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

	const handleOpenSaveDialog = () => {
		showSaveDialog = true;
	};

	const handleMapSaved = (newStyle: DashboardMapStyle) => {
		style = newStyle;
		showSaveDialog = false;
	};

	const handleOpenShareDialog = () => (showShareDialog = true);

	const isReadOnly = () => {
		return !(
			page.data.session?.user?.email === style?.created_user ||
			page.data.session?.user?.is_superuser ||
			(style.permission && style.permission > Permission.READ)
		);
	};

	const handleExportClicked = () => {
		dispatch('export');
	};

	onMount(() => {
		enableDevMode();
	});
</script>

{#if $pageDataLoadingStore === true}
	<div class="is-flex is-justify-content-center is-align-items-center" style="margin-top: 40%;">
		<Loader size="medium" />
	</div>
{:else}
	<div
		class="is-flex is-align-items-center layer-header pt-2 px-4"
		bind:clientHeight={layerHeaderHeight}
	>
		{#if $layerListStore?.length > 0}
			<div class="layer-header-buttons buttons mb-0">
				{#key $layerListStore}
					<button
						class="button m-0 px-4"
						disabled={expandAllDisabled()}
						onclick={handleExpandAll}
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
						onclick={handleCollapseAll}
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
						onclick={openDeleteDialog}
					>
						<span class="icon">
							<span class="material-icons"> layers_clear </span>
						</span>
					</button>
				{/key}
			</div>
		{:else}
			<div class="p-2">
				<Notification type="info" showCloseButton={false}>
					No layers have been selected. Please select a layer from the <strong
						>{TabNames.DATA}</strong
					> tab.
				</Notification>
				<button
					class="button is-primary mt-2 has-text-weight-bold is-uppercase is-fullwidth"
					onclick={handleExploreDatasets}
				>
					<span>Explore datasets</span>
				</button>
			</div>
		{/if}
	</div>
	<div class="layer-list">
		<div class="layer-contents" style="height: {totalHeight}px;">
			{#key isLayerListChanged}
				{#each $layerListStore as layer, index}
					<LayerTemplate
						bind:layer={$layerListStore[index]}
						isExpanded={layer.isExpanded as boolean}
						ontoggled={handleLayerToggled}
						onchange={handleLayerListChanged}
						showEditButton={true}
					></LayerTemplate>
				{/each}
			{/key}
		</div>

		<div class="layer-footer mt-auto px-4 pt-4 is-flex" bind:clientHeight={layerFooterHeight}>
			{#key isNewMapMode}
				<div
					style="width: 100%;"
					use:tippyTooltip={{
						content: saveDisabled
							? 'To save the map, you need to sign in and add at least a layer to the map'
							: 'Save this map to GeoHub'
					}}
				>
					<button
						class="button {saveDisabled
							? ''
							: 'is-link'} is-uppercase has-text-weight-bold is-fullwidth"
						disabled={saveDisabled}
						onclick={handleOpenSaveDialog}
					>
						<span> {isNewMapMode || isReadOnly() ? 'Save' : 'Update'} map </span>
					</button>
				</div>

				<div
					class="ml-2"
					use:tippyTooltip={{
						content: isNewMapMode
							? 'You need to save the map first to enable sharing.'
							: 'Share this map with others!'
					}}
				>
					<button
						class="button {isNewMapMode
							? ''
							: 'is-link is-outlined'} is-uppercase has-text-weight-bold"
						disabled={isNewMapMode}
						onclick={handleOpenShareDialog}
					>
						<span class="icon is-small">
							<span class="material-symbols-outlined"> share </span>
						</span>
					</button>
				</div>
			{/key}
			<div class="ml-2" use:tippyTooltip={{ content: 'Export your map as image.' }}>
				<button
					class="export-button button is-link is-outlined is-uppercase has-text-weight-bold"
					onclick={handleExportClicked}
				>
					<span class="icon is-small">
						<span class="material-symbols-outlined"> print </span>
					</span>
				</button>
			</div>
		</div>
	</div>
{/if}

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

{#if $map}
	<StyleSaveDialog
		bind:map={$map}
		bind:isModalVisible={showSaveDialog}
		layerList={layerListStore}
		onchange={handleMapSaved}
	/>

	<StyleShareDialog bind:style bind:isModalVisible={showShareDialog} />
{/if}

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
		position: relative;

		.layer-contents {
			overflow-y: auto;
		}

		.layer-footer {
			position: sticky;
			bottom: 0;
		}
	}
</style>
