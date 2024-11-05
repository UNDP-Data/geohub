<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { getContext, onMount } from 'svelte';
	import MaplibreColorPicker from '../util/MaplibreColorPicker.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	/**
	 * Layer ID to edit
	 */
	export let layerId: string;

	/**
	 * Layer ID to edit
	 */
	export let defaultColor: string = 'rgba(0,0,0,1)';

	const propertyName = 'circle-stroke-color';

	const getColor = (): string => {
		let color = $map.getPaintProperty(layerId, propertyName);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!color || (color && color.type === 'interval') || (color && color.type === 'categorical')) {
			color = defaultColor;
		}
		return color as string;
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
