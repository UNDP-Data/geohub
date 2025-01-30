<script lang="ts">
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	const dispatch = createEventDispatcher();

	let propertyName = 'text-max-width';
	let value = $state(style.layout && style.layout[propertyName] ? style.layout[propertyName] : 10);
	let layerType = 'symbol';
	let maxValue = $state(20);
	let minValue = $state(0);
	let stepValue = $state(1);

	const setValue = () => {
		if (style.type !== layerType) return;
		map.setLayoutProperty(layerId, propertyName, value);
		dispatch('change');
	};
	onMount(() => {
		setValue();
	});
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} onchange={setValue} />
