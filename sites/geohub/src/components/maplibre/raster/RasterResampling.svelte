<script lang="ts">
	import ToggleOptions from '$components/util/ToggleOptions.svelte';
	import type { ToggleOption } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

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
