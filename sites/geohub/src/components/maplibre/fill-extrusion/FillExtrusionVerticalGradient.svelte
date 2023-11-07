<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Checkbox } from '@undp-data/svelte-undp-design';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	let defaultValue = true;
	let propertyName = 'fill-extrusion-vertical-gradient';

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, propertyName) ?? defaultValue;
		return value as boolean;
	};

	let value = getValue();

	onMount(() => {
		setValue();
	});

	$: value, setValue();

	const setValue = () => {
		map.setPaintProperty(layerId, propertyName, value);
	};
</script>

<Checkbox label="Apply a vertical gradient to the sides of polygons" bind:checked={value} />
