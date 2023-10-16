<script lang="ts">
	import MaplibreColorPicker from '$components/maplibre/MaplibreColorPicker.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	const propertyName = 'fill-outline-color';
	export let defaultColor: string = undefined;

	const getFillOutlineColor = (): string => {
		let fillOutlineColor = $map.getPaintProperty(layerId, 'fill-outline-color');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (
			!fillOutlineColor ||
			(fillOutlineColor && fillOutlineColor.type === 'interval') ||
			(fillOutlineColor && fillOutlineColor.type === 'categorical')
		) {
			fillOutlineColor = defaultColor;
		}
		return fillOutlineColor as string;
	};

	let rgba = getFillOutlineColor();

	onMount(() => {
		rgba = getFillOutlineColor();
		map.setPaintProperty(layerId, propertyName, rgba);
	});

	const handleSetColor = (e: CustomEvent) => {
		rgba = e.detail.color;
		map.setPaintProperty(layerId, propertyName, rgba);
	};
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
