<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';

	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

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
	let value = $state(getResamplingMethod() as string);

	const setValue = () => {
		map.setPaintProperty(layerId, 'raster-resampling', value);
	};
	onMount(() => {
		setValue();
	});
</script>

<div class="select is-fullwidth">
	<select bind:value onchange={setValue}>
		{#each options as option}
			<option value={option.value}>{option.title}</option>
		{/each}
	</select>
</div>
