<script lang="ts">
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		defaultSize?: number;
	}

	let { layerId = $bindable(), defaultSize = $bindable(16) }: Props = $props();

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let layerType = 'symbol';
	let maxValue = $state(32);
	let minValue = $state(0);
	let propertyName = 'text-size';
	let stepValue = $state(0.5);
	let value = $state(
		style.layout && style.layout[propertyName] ? style.layout[propertyName] : defaultSize
	);

	const setValue = () => {
		if (style.type !== layerType) return;
		map.setLayoutProperty(layerId, propertyName, value);
	};
	onMount(() => {
		setValue();
	});
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} onchange={setValue} />
