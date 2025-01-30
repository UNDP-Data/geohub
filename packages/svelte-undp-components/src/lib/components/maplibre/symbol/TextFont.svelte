<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		fontJsonUrl?: string;
	}

	let {
		layerId = $bindable(),
		fontJsonUrl = $bindable('https://fonts.undpgeohub.org/fonts.json')
	}: Props = $props();

	const propertyName = 'text-font';
	const defaultValue = 'Open Sans Regular';

	let fonts: string[] = $state([]);

	onMount(async () => {
		const res = await fetch(fontJsonUrl);
		fonts = await res.json();
	});

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let value = $state(
		style.layout && style.layout[propertyName]?.length > 0
			? style.layout[propertyName][0]
			: defaultValue
	);

	const setValue = () => {
		map.setLayoutProperty(layerId, propertyName, [value]);
	};
	onMount(() => {
		setValue();
	});
</script>

<div class="select is-fullwidth">
	<select bind:value onchange={setValue}>
		{#each fonts as font}
			<option value={font}>{font}</option>
		{/each}
	</select>
</div>
