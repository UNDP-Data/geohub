<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let fontJsonUrl = 'https://fonts.undpgeohub.org/fonts.json';

	const propertyName = 'text-font';
	const defaultValue = 'Open Sans Regular';

	let fonts: string[] = [];

	onMount(async () => {
		const res = await fetch(fontJsonUrl);
		fonts = await res.json();
	});

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let value =
		style.layout && style.layout[propertyName]?.length > 0
			? style.layout[propertyName][0]
			: defaultValue;

	$: value, setValue();

	const setValue = () => {
		map.setLayoutProperty(layerId, propertyName, [value]);
	};
</script>

<div class="select is-fullwidth">
	<select bind:value>
		{#each fonts as font}
			<option value={font}>{font}</option>
		{/each}
	</select>
</div>
