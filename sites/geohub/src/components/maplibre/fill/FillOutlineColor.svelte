<script lang="ts">
	import MaplibreColorPicker from '$components/maplibre/MaplibreColorPicker.svelte';
	import {
		DEFAULTCOLOR_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type DefaultColorStore,
		type MapStore
	} from '$stores';
	import chroma from 'chroma-js';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const defaultColorStore: DefaultColorStore = getContext(DEFAULTCOLOR_CONTEXT_KEY);

	export let layerId: string;
	const propertyName = 'fill-outline-color';

	let defaultColor: string;

	const getFillOutlineColor = (): string => {
		let fillOutlineColor = $map.getPaintProperty(layerId, 'fill-outline-color');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (
			!fillOutlineColor ||
			(fillOutlineColor && fillOutlineColor.type === 'interval') ||
			(fillOutlineColor && fillOutlineColor.type === 'categorical')
		) {
			if (!defaultColor) {
				defaultColor =
					$defaultColorStore?.length > 0 ? chroma($defaultColorStore).darken(2.5).hex() : '#000';
			}
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
