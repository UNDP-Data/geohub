<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import MaplibreColorPicker from '$components/maplibre/MaplibreColorPicker.svelte';
	import type { Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const layerId = layer.id;
	const propertyName = 'icon-color';
	export let defaultColor: string;

	const getIconColor = (): string => {
		let iconColor = $map.getPaintProperty(layer.id, 'icon-color');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (
			!iconColor ||
			(iconColor && iconColor.type === 'interval') ||
			(iconColor && iconColor.type === 'categorical')
		) {
			iconColor = defaultColor;
		}
		return iconColor as string;
	};

	let rgba = getIconColor();

	onMount(() => {
		rgba = getIconColor();
		map.setPaintProperty(layerId, propertyName, rgba);
	});

	const handleSetColor = (e: CustomEvent) => {
		if (e?.detail?.color) {
			map.setPaintProperty(layerId, propertyName, e.detail.color);
			defaultColor = e.detail.color;
			$map.fire('icon-color:changed', { color: e.detail.color });
		}
	};
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
