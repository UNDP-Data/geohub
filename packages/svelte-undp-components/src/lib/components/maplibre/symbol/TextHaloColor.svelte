<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';
	import MaplibreColorPicker from '../util/MaplibreColorPicker.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	const propertyName = 'text-halo-color';
	const defaultColor = `rgba(255,255,255,1)`;
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let rgba = $state(
		style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultColor
	);

	const handleSetColor = (color: string) => {
		if (style.type !== 'symbol') return;
		rgba = color;
		map.setPaintProperty(layerId, propertyName, rgba);
	};
</script>

<MaplibreColorPicker {rgba} onchange={handleSetColor} />
