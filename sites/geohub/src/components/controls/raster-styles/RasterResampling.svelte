<script lang="ts">
	import ToggleOptions from './ToggleOptions.svelte';
	import type { Map } from 'maplibre-gl';
	import type { ToggleOption } from '$lib/types';

	export let map: Map;
	export let layerId: string;

	let options: ToggleOption[] = [
		{
			title: 'Bi-linear',
			value: 'linear'
		},
		{
			title: 'Nearest Neighbor',
			value: 'nearest'
		}
	];

	const getResamplingMethod = () => {
		return map?.getPaintProperty(layerId, 'raster-resampling') || 'linear';
	};
	let value = getResamplingMethod();

	$: value, setValue();

	const setValue = () => {
		map?.setPaintProperty(layerId, 'raster-resampling', value);
	};
</script>

<ToggleOptions bind:options bind:selectedValue={value} />
