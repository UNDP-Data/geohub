<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext } from 'svelte';
	import Slider from './Slider.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, 'raster-saturation');

		if (!value) {
			value = 0;
		}
		return value as number;
	};

	let value = getValue();

	$: value, setValue();

	const setValue = () => {
		map.setPaintProperty(layerId, 'raster-saturation', value);
	};
</script>

<Slider bind:value min={-1} max={1} step={0.1} unit="" />
