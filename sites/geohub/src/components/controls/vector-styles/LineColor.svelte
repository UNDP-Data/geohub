<script lang="ts">
	import { getContext, onMount } from 'svelte';

	import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const layerId = layer.id;
	const propertyName = 'line-color';
	export let defaultColor: string = undefined;

	const getLineColor = (): string => {
		let lineColor = $map.getPaintProperty(layerId, 'line-color');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (
			!lineColor ||
			(lineColor && lineColor.type === 'interval') ||
			(lineColor && lineColor.type === 'categorical')
		) {
			lineColor = defaultColor;
		}
		return lineColor as string;
	};

	let rgba = getLineColor();

	onMount(() => {
		rgba = getLineColor();
		map.setPaintProperty(layerId, propertyName, rgba);
	});

	const handleSetColor = (e: CustomEvent) => {
		if (e?.detail?.color) {
			map.setPaintProperty(layerId, propertyName, e.detail.color);
			$map.fire('line-color:changed', { value: e.detail.color });
			defaultColor = e.detail.color;
		}
	};
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
