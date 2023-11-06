<script lang="ts">
	import MaplibreColorPicker from '$components/maplibre/MaplibreColorPicker.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	const propertyName = 'fill-extrusion-color';
	export let defaultColor: string = undefined;

	const getColor = (): string => {
		let fillColor = $map.getPaintProperty(layerId, propertyName);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!fillColor) {
			fillColor = defaultColor;
		}
		return fillColor as string;
	};

	let rgba = getColor();

	onMount(() => {
		rgba = getColor();
		map.setPaintProperty(layerId, propertyName, rgba);
	});

	const handleSetColor = (e: CustomEvent) => {
		rgba = e.detail.color;
		map.setPaintProperty(layerId, propertyName, rgba);
		defaultColor = e.detail.color;
	};
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
