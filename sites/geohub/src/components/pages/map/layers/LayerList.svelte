<script lang="ts">
	import { page } from '$app/stores';
	import LayerOrderPanelButton from '$components/pages/map/layers/order/LayerOrderPanelButton.svelte';
	import RasterLayer from '$components/pages/map/layers/raster/RasterLayer.svelte';
	import VectorLayer from '$components/pages/map/layers/vector/VectorLayer.svelte';
	import Modal from '$components/util/Modal.svelte';
	import Notification from '$components/util/Notification.svelte';
	import Star from '$components/util/Star.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { getLayerStyle } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, layerList, type MapStore } from '$stores';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let contentHeight: number;
	export let activeTab: TabNames;

	let style: DashboardMapStyle = $page.data.style;

	let layerHeaderHeight = 39;

	$: totalHeight = contentHeight - layerHeaderHeight;

	const handleExploreDatasets = () => {
		activeTab = TabNames.DATA;
		const url = $page.url;
		url.searchParams.set('activetab', activeTab);
		history.replaceState({}, null, url.toString());
	};

	let isDeleteDialogVisible = false;
	const openDeleteDialog = () => {
		isDeleteDialogVisible = true;
	};
	const handleDeleteAll = async () => {
		for (const layer of $layerList) {
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
			const layerListforDelSource = $layerList.filter(
				(item) => getLayerStyle($map, item.id)?.source === delSourceId
			);
			if (layerListforDelSource.length === 0) {
				$map.removeSource(delSourceId);
			}
		}
		$layerList = [];

		isDeleteDialogVisible = false;
	};

	const handleCancel = () => {
		isDeleteDialogVisible = false;
	};
</script>

{#if $layerList?.length > 0}
	<div
		class="is-flex is-align-items-center layer-header px-2 pt-2"
		bind:clientHeight={layerHeaderHeight}
	>
		{#if style}
			<Star bind:id={style.id} bind:isStar={style.is_star} table="style" />
		{/if}
		<div class="layer-header-buttons">
			<button
				class="button has-tooltip-arrow has-tooltip-bottom"
				disabled={$layerList?.length === 0}
				data-tooltip="Delete all layers"
				on:click={openDeleteDialog}
			>
				<span class="delete-all-icon icon fa-stack fa-lg" role="button" tabindex="0">
					<i class="fa-solid fa-layer-group fa-lg" />
					<i class="fa-solid fa-circle-xmark fa-xs fa-stack-1x" />
				</span>
			</button>

			<LayerOrderPanelButton />
		</div>
	</div>
{/if}
<div class="layer-list p-2" style="height: {totalHeight}px;">
	{#if $layerList?.length === 0}
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

	{#each $layerList as layer (layer.id)}
		{@const type = getLayerStyle($map, layer.id)?.type}
		{#if type === 'raster'}
			<RasterLayer {layer} />
		{:else}
			<VectorLayer {layer} />
		{/if}
	{/each}
</div>

<Modal
	bind:dialogOpen={isDeleteDialogVisible}
	on:cancel={handleCancel}
	on:continue={handleDeleteAll}
	target={$layerList.map((l) => l.name).join(', ')}
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
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 5px;
			width: fit-content;

			.delete-all-icon {
				.fa-layer-group {
					margin-right: 6px;
				}

				.fa-circle-xmark {
					margin-left: 8px;
					margin-top: 15px;
				}
			}
		}
	}

	.layer-list {
		overflow-y: auto;
	}
</style>
