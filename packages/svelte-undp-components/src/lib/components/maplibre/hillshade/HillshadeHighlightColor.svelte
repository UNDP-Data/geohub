<script lang="ts">
	import MaplibreColorPicker from '$lib/components/maplibre/util/MaplibreColorPicker.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();
	const propertyName = 'hillshade-highlight-color';

	let defaultColor = '#FFFFFF';

	const getColor = (): string => {
		let color = $map.getPaintProperty(layerId, propertyName);
		if (!color) {
			color = defaultColor;
		}
		return color as string;
	};

	let rgba = $state(getColor());

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
