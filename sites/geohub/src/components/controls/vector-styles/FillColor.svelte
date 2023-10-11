<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const layerId = layer.id;
	const propertyName = 'fill-color';
	export let defaultColor: string = undefined;

	const getFillColor = (): string => {
		let fillColor = $map.getPaintProperty(layerId, propertyName);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (
			!fillColor ||
			(fillColor && fillColor.type === 'interval') ||
			(fillColor && fillColor.type === 'categorical')
		) {
			fillColor = defaultColor;
		}
		return fillColor as string;
	};

	let rgba = getFillColor();

	onMount(() => {
		rgba = getFillColor();
		map.setPaintProperty(layerId, propertyName, rgba);
	});

	const handleSetColor = (e: CustomEvent) => {
		rgba = e.detail.color;
		map.setPaintProperty(layerId, propertyName, rgba);
		defaultColor = e.detail.color;
	};
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
