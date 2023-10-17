<script lang="ts">
	import type { Layer } from '$lib/types';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';
	import MaplibreColorPicker from '$components/maplibre/MaplibreColorPicker.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const dispatch = createEventDispatcher();
	const layerId = layer.id;
	const propertyName = 'text-halo-color';
	const defaultColor = `rgba(255,255,255,1)`;
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let rgba = style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultColor;

	const handleSetColor = (e: CustomEvent) => {
		if (style.type !== 'symbol') return;
		rgba = e.detail.color;
		map.setPaintProperty(layerId, propertyName, rgba);
		dispatch('change');
	};
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
