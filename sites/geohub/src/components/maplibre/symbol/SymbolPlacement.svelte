<script lang="ts">
	import type { VectorLayerTypes } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { clean } from '@undp-data/svelte-undp-components';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let parentId: string;

	const dispatch = createEventDispatcher();
	// const layerId = layer.id;
	const propertyName = 'icon-keep-upright';
	const propertyNameSymbolPlacement = 'symbol-placement';
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];
	let parentType: VectorLayerTypes | 'raster' | 'hillshade' | 'background' = 'symbol';

	// const parentId = layer.parentId;
	if (parentId) {
		const parentStyle = $map
			.getStyle()
			.layers.filter((layer: LayerSpecification) => layer.id === parentId)[0];
		parentType = parentStyle.type;
	}

	// let checked = style.layout && style.layout[propertyName] ? style.layout[propertyName] : false
	let choices = ['point', 'line', 'line-center'];

	let defaultValue = 'point';
	switch (parentType) {
		case 'line':
			defaultValue = 'line-center';
			break;
		case 'fill':
			defaultValue = 'point';
			break;
	}

	let selected =
		style.layout && style.layout[propertyNameSymbolPlacement]
			? style.layout[propertyNameSymbolPlacement]
			: defaultValue;

	$: selected, setSymbolPlacement();

	const setSymbolPlacement = () => {
		if (style.type !== 'symbol') return;
		const newStyle = JSON.parse(JSON.stringify(style));
		if (!newStyle.layout) {
			newStyle.layout = {};
		}

		newStyle.layout[propertyNameSymbolPlacement] = selected;
		map.setLayoutProperty(layerId, propertyNameSymbolPlacement, selected);
		map.setLayoutProperty(layerId, propertyName, selected !== 'point');

		dispatch('change');
	};
</script>

<div class="select" style="height: 30px;">
	<select bind:value={selected} style="width: 100%;" title="Icon overlap">
		{#each choices as choice}
			<option class="legend-text" value={choice}>{clean(choice)}</option>
		{/each}
	</select>
</div>
