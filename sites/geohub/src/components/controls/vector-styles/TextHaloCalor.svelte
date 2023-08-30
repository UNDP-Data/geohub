<script lang="ts">
	import type { Layer } from '$lib/types';
	import { map } from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher } from 'svelte';

	import MaplibreColorPicker from './MaplibreColorPicker.svelte';

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
