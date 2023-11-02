<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Select, type SelectItem } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	let items: SelectItem[] = [
		{
			label: 'Bi-linear',
			value: 'linear'
		},
		{
			label: 'Nearest Neighbor',
			value: 'nearest'
		}
	];

	const getResamplingMethod = () => {
		return $map.getPaintProperty(layerId, 'raster-resampling') || 'linear';
	};
	let value = getResamplingMethod() as string;

	let selectedItem = items.find((i) => i.value === value) ?? items[0];

	$: selectedItem, setValue();

	const setValue = () => {
		if (!selectedItem) return;
		map.setPaintProperty(layerId, 'raster-resampling', selectedItem.value);
	};
</script>

<Select {items} bind:selectedItem placeholder="Select resampling" />
