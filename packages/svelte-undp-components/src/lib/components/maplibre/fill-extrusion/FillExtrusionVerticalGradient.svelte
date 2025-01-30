<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { Checkbox } from '@undp-data/svelte-undp-design';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	let defaultValue = true;
	let propertyName = 'fill-extrusion-vertical-gradient';

	const getValue = () => {
		let value = $map.getPaintProperty(layerId, propertyName) ?? defaultValue;
		return value as boolean;
	};

	let value = $state(getValue());

	onMount(() => {
		setValue();
	});

	const setValue = () => {
		map.setPaintProperty(layerId, propertyName, value);
	};
</script>

<Checkbox
	label="Apply a vertical gradient to the sides of polygons"
	bind:checked={value}
	on:clicked={setValue}
/>
