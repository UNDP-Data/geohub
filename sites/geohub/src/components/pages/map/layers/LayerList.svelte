<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import LayerOrderPanelButton from '$components/pages/map/layers/order/LayerOrderPanelButton.svelte';
	import RasterSimpleLayer from '$components/pages/map/layers/raster/RasterSimpleLayer.svelte';
	import VectorSimpleLayer from '$components/pages/map/layers/vector/VectorSimpleLayer.svelte';
	import Modal from '$components/util/Modal.svelte';
	import Notification from '$components/util/Notification.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { getLayerStyle, initTooltipTippy } from '$lib/helper';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		LEGEND_READONLY_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		createLegendReadonlyStore,
		type LayerListStore,
		type LegendReadonlyStore,
		type MapStore
	} from '$stores';
	import { getContext, setContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	const legendReadonly: LegendReadonlyStore = createLegendReadonlyStore();
	$legendReadonly = true;
	setContext(LEGEND_READONLY_CONTEXT_KEY, legendReadonly);

	export let contentHeight: number;
	export let activeTab: TabNames;

	const tippyTooltip = initTooltipTippy();
	let layerHeaderHeight = 39;

	$: totalHeight = contentHeight - layerHeaderHeight;

	const handleExploreDatasets = () => {
		activeTab = TabNames.DATA;
		const url = $page.url;
		url.searchParams.set('activetab', activeTab);
		replaceState(url);
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
</script>

{#if $layerListStore?.length > 0}
	<div
		class="is-flex is-align-items-center layer-header px-2 pt-2"
		bind:clientHeight={layerHeaderHeight}
	>
		<div class="layer-header-buttons buttons mb-0">
			{#key $layerListStore}
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

				{#if $layerListStore?.length > 1}
					<LayerOrderPanelButton />
				{/if}

				<button
					class="button m-0 px-3"
					disabled={$layerListStore?.length === 0}
					use:tippyTooltip={{ content: 'Delete all layers' }}
					on:click={openDeleteDialog}
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
								id="mask0_2498_5852"
								style="mask-type:alpha"
								maskUnits="userSpaceOnUse"
								x="0"
								y="0"
								width="24"
								height="25"
							>
								<rect y="0.301025" width="24" height="24" fill="#D9D9D9" />
							</mask>
							<g mask="url(#mask0_2498_5852)">
								<path
									d="M16.1 13.101L14.7 11.651L17.75 9.30103L12 4.85103L9.65 6.65103L8.25 5.20103L12 2.30103L21 9.30103L16.1 13.101ZM18.975 15.951L17.525 14.501L19.35 13.101L21 14.351L18.975 15.951ZM19.8 22.401L15.8 18.401L12 21.351L3 14.351L4.65 13.101L12 18.801L14.35 16.976L12.925 15.576L12 16.301L3 9.30103L5.075 7.67603L1.375 4.02603L2.8 2.60103L21.2 21.001L19.8 22.401Z"
									fill="#55606E"
								/>
							</g>
						</svg>
					</span>
				</button>
			{/key}
		</div>
	</div>
{/if}
<div class="layer-list p-2" style="height: {totalHeight}px;">
	{#if $layerListStore?.length === 0}
		<div class="p-2">
			<Notification type="info" showCloseButton={false}>
				No layers have been selected. Please select a layer from the <strong>{TabNames.DATA}</strong
				> tab.
			</Notification>
			<button class="button is-primary is-large is-fullwidth mt-2" on:click={handleExploreDatasets}>
				<span class="icon">
					<i class="fa-solid fa-magnifying-glass"></i>
				</span>
				<span>Explore datasets</span>
			</button>
		</div>
	{/if}

	{#each $layerListStore as layer (layer.id)}
		{@const type = getLayerStyle($map, layer.id)?.type}
		{#if type}
			{#if type === 'raster'}
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

<Modal
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
