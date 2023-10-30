<script lang="ts">
	import PanelButton from '$components/util/PanelButton.svelte';
	import { clean } from '$lib/helper';
	import { layerList, MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Checkbox } from '@undp-data/svelte-undp-design';
	import type { StyleSpecification } from 'maplibre-gl';
	import LayerOrderPanel from '$components/pages/map/layers/order/LayerOrderPanel.svelte';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	let onlyRendered = false;
	let onlyRelative = true;
	let relativeLayers: { [key: string]: string } = {};
	let style: StyleSpecification;

	$: if ($map) {
		$map.on('styledata', function () {
			style = $map.getStyle();
			updateLayerOrderList();
		});
		$map.on('sourcedata', function (e) {
			if (e.isSourceLoaded) {
				style = $map.getStyle();
				updateLayerOrderList();
			}
		});
	}

	$: if ($map) {
		updateLayerOrderList();
	}

	$: $layerList, updateLayerOrderList();

	const updateLayerOrderList = () => {
		if ($map && $layerList) {
			relativeLayers = {};
			$layerList.forEach((layer) => {
				relativeLayers[layer.id] = clean(layer.name);

				layer.children?.forEach((child) => {
					relativeLayers[child.id] = `${clean(layer.name)} label`;
				});
			});
			style = $map.getStyle();
		}
	};
</script>

<PanelButton
	icon="fa-solid fa-arrow-down-up-across-line"
	iconDisabled="fa-solid fa-arrow-down-up-lock"
	tooltip="Change layer order"
	position="left"
	width="300px"
	disabled={$layerList?.length < 2}
>
	<p class="title is-5 mx-2 mt-0 mb-2 p-0">Layer order settings</p>
	<p class="mx-2 mb-1">Drag and drop to change layer order for rendering in the map.</p>

	<div class="header mx-2 mt-1 mb-2 pb-2">
		<Checkbox label="Show only GeoHub layers" bind:checked={onlyRelative} />
	</div>

	<div class="layer-order">
		<LayerOrderPanel bind:style bind:onlyRendered bind:onlyRelative bind:relativeLayers />
	</div>
</PanelButton>

<style lang="scss">
	.header {
		border-bottom: 1px solid gray;
	}

	.layer-order {
		overflow-y: auto;
		max-height: 300px;
	}
</style>
