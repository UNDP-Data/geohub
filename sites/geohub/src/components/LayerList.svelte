<script lang="ts">
	import { page } from '$app/stores';
	import RasterLayer from '$components/RasterLayer.svelte';
	import VectorLayer from '$components/VectorLayer.svelte';
	import { TabNames } from '$lib/config/AppConfig';
	import { getLayerStyle } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import { layerList, map } from '$stores';
	import LayerOrderPanelButton from './LayerOrderPanelButton.svelte';
	import Notification from './controls/Notification.svelte';
	import Star from './data-view/Star.svelte';

	export let contentHeight: number;

	let style: DashboardMapStyle = $page.data.style;

	let layerHeaderHeight = 39;

	$: totalHeight = contentHeight - layerHeaderHeight;
</script>

{#if $layerList?.length > 0}
	<div
		class="is-flex is-align-items-center layer-header px-2 pt-2"
		bind:clientHeight={layerHeaderHeight}
	>
		{#if style}
			<Star bind:id={style.id} bind:isStar={style.is_star} table="style" />
		{/if}
		<div class="layer-order">
			<LayerOrderPanelButton />
		</div>
	</div>
{/if}
<div class="layer-list mx-2 mt-1" style="height: {totalHeight}px;">
	{#if $layerList?.length === 0}
		<Notification type="info">
			No layers have been selected. Please select a layer from the <strong>{TabNames.DATA}</strong> tab.
		</Notification>
	{/if}

	{#each $layerList as layer (layer.id)}
		<div class="box p-0 mx-1 my-3">
			{#if getLayerStyle($map, layer.id).type === 'raster'}
				<RasterLayer {layer} />
			{:else}
				<VectorLayer {layer} />
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.layer-header {
		width: 100%;

		.layer-order {
			margin-left: auto;
		}
	}

	.layer-list {
		overflow-y: auto;
	}
</style>
