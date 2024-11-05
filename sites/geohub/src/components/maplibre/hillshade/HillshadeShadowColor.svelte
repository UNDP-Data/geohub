<script lang="ts">
	import {
		MAPSTORE_CONTEXT_KEY,
		type MapStore,
		MaplibreColorPicker
	} from '@undp-data/svelte-undp-components';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	const propertyName = 'hillshade-shadow-color';

	let defaultColor = '#FFFFFF';

	const getColor = (): string => {
		let color = $map.getPaintProperty(layerId, propertyName);
		if (!color) {
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
	};
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
