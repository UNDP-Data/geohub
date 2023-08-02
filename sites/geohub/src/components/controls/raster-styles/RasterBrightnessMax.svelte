<script lang="ts">
	import Slider from './Slider.svelte';
	import type { Map } from 'maplibre-gl';

	export let map: Map;
	export let layerId: string;

	const getValue = () => {
		let value = map.getPaintProperty(layerId, 'raster-brightness-max');

		if (!value) {
			value = 1;
		}
		return value as number;
	};

	let value = getValue();

	$: value, setValue();

	const setValue = () => {
		map?.setPaintProperty(layerId, 'raster-brightness-max', value);
	};
</script>

<Slider bind:value min={0} max={1} step={0.1} unit="" />
