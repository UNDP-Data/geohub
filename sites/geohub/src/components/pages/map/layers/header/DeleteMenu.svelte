<script lang="ts">
	import Modal from '$components/util/Modal.svelte';
	import { clean, getLayerStyle } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import { getContext } from 'svelte';
	import Keydown from 'svelte-keydown';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	export let layer: Layer;
	export let isVisible = false;

	const handleDelete = () => {
		const layerId = layer.id;
		isVisible = false;

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
		}, 200);
	};

	const handleCancel = () => {
		isVisible = false;
	};
</script>

<Keydown paused={!isVisible} on:Escape={() => (isVisible = false)} />

<Modal
	bind:dialogOpen={isVisible}
	on:cancel={handleCancel}
	on:continue={handleDelete}
	title="Delete Layer"
	message="Are you sure you want to delete this layer?"
	target={clean(layer.name)}
	cancelText="Cancel"
	continueText="Delete"
/>
