<script lang="ts">
	import MaplibreColorPicker from '$components/maplibre/MaplibreColorPicker.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	const dispatch = createEventDispatcher();
	const propertyName = 'text-color';
	const defaultColor = `rgba(0,0,0,1)`;
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
