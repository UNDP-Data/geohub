<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	let options = [
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

<div class="select is-fullwidth">
	<select bind:value>
		{#each options as option}
			<option value={option.value}>{option.title}</option>
		{/each}
	</select>
</div>
