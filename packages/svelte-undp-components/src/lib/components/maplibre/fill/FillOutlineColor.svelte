<script lang="ts">
	import MaplibreColorPicker from '$lib/components/maplibre/util/MaplibreColorPicker.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	const propertyName = 'fill-outline-color';

	let defaultColor = 'rgba(0,0,0,1)';

	const getFillOutlineColor = (): string => {
		let fillOutlineColor = $map.getPaintProperty(layerId, 'fill-outline-color');

		if (
			!fillOutlineColor ||
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			(fillOutlineColor && fillOutlineColor.type === 'interval') ||
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
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
