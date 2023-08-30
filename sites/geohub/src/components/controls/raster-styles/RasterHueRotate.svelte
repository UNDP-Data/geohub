<script lang="ts">
	import { map } from '$stores';
	import Slider from './Slider.svelte';

	export let layerId: string;

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, 'raster-hue-rotate');

		if (!value) {
			value = 0;
		}
		return value as number;
	};

	let value = getValue();

	$: value, setValue();

	const setValue = () => {
		map.setPaintProperty(layerId, 'raster-hue-rotate', value);
	};
</script>

<Slider bind:value min={0} max={359} step={1} unit="°" />
