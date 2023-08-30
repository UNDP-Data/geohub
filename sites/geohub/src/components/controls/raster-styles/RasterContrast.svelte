<script lang="ts">
	import { map } from '$stores';
	import Slider from './Slider.svelte';

	export let layerId: string;

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, 'raster-contrast');

		if (!value) {
			value = 0;
		}
		return value as number;
	};

	let value = getValue();

	$: value, setValue();

	const setValue = () => {
		map.setPaintProperty(layerId, 'raster-contrast', value);
	};
</script>

<Slider bind:value min={-1} max={1} step={0.1} unit="" />
