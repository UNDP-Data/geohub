<script lang="ts">
	import type { ToggleOption } from '$lib/types';
	import { map } from '$stores';
	import ToggleOptions from './ToggleOptions.svelte';

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
		return $map.getPaintProperty(layerId, 'raster-resampling') || 'linear';
	};
	let value = getResamplingMethod() as string;

	$: value, setValue();

	const setValue = () => {
		map.setPaintProperty(layerId, 'raster-resampling', value);
	};
</script>

<ToggleOptions bind:options bind:selectedValue={value} />
