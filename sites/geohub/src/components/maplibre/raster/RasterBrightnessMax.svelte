<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext } from 'svelte';
	import Slider from '$components/maplibre/raster/Slider.svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, 'raster-brightness-max');

		if (!value) {
			value = 1;
		}
		return value as number;
	};

	let value = getValue();

	$: value, setValue();

	const setValue = () => {
		map.setPaintProperty(layerId, 'raster-brightness-max', value);
	};
</script>

<Slider bind:value min={0} max={1} step={0.1} unit="" />
