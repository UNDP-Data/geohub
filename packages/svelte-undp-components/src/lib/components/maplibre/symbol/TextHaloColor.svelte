<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';
	import MaplibreColorPicker from '../util/MaplibreColorPicker.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	const dispatch = createEventDispatcher();
	const propertyName = 'text-halo-color';
	const defaultColor = `rgba(255,255,255,1)`;
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let rgba = $state(
		style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultColor
	);

	const handleSetColor = (e: CustomEvent) => {
		if (style.type !== 'symbol') return;
		rgba = e.detail.color;
		map.setPaintProperty(layerId, propertyName, rgba);
		dispatch('change');
	};
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
