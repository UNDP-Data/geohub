<script lang="ts">
	import MaplibreColorPicker from '$lib/components/maplibre/util/MaplibreColorPicker.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		/**
		 * Layer ID to edit
		 */
		layerId: string;
		/**
		 * Layer ID to edit
		 */
		defaultColor?: string;
	}

	let { layerId = $bindable(), defaultColor = $bindable('rgba(0,0,0,1)') }: Props = $props();

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

	let rgba = $state(getColor());

	onMount(() => {
		rgba = getColor();
		map.setPaintProperty(layerId, propertyName, rgba);
	});

	const handleSetColor = (color: string) => {
		rgba = color;
		map.setPaintProperty(layerId, propertyName, rgba);
		defaultColor = color;
	};
</script>

<MaplibreColorPicker {rgba} onchange={handleSetColor} />
