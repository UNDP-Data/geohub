<script lang="ts">
	import type { Layer } from '$lib/types';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { cloneDeep } from 'lodash-es';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	const tippyTooltip = initTooltipTippy();

	export let layer: Layer;

	const layerId = layer.id;

	$: visibility = getVisibility();

	const getVisibility = (): 'visible' | 'none' => {
		const layerStyle = $map.getStyle().layers.find((l) => l.id === layer.id);
		let visibility: 'visible' | 'none' = 'visible';
		if (layerStyle && layerStyle.layout && layerStyle.layout.visibility) {
			visibility = layerStyle.layout.visibility;
		}
		return visibility;
	};

	const toggleVisibility = () => {
		visibility = visibility === 'visible' ? 'none' : 'visible';
		map.setLayoutProperty(layerId, 'visibility', visibility);

		const layerClone = cloneDeep(layer);
		const layerIndex = $layerListStore.findIndex((layer) => layer.id === layerId);
		$layerListStore[layerIndex] = layerClone;

		if (layer.children && layer.children.length > 0) {
			layer.children.forEach((child) => {
				if (!$map.getLayer(child.id)) return;
				map.setLayoutProperty(child.id, 'visibility', visibility);
			});
		}
	};

	onMount(() => {
		$map.on('styledata', () => {
			visibility = getVisibility();
		});
	});
</script>

<button
	class="button menu-button px-3 py-0"
	on:click={toggleVisibility}
	use:tippyTooltip={{ content: 'Change the layer visibility' }}
>
	<span class="icon is-small">
		<i class="fa-solid {visibility === 'visible' ? 'fa-eye' : 'fa-eye-slash'} has-text-grey-dark" />
	</span>
</button>

<style lang="scss">
	.menu-button {
		border: none;
		background: transparent;
		box-shadow: none;
	}
</style>
