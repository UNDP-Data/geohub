<script lang="ts">
	import { NumberInput } from '$lib/components/ui';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		defaultHaloWidth?: number;
	}

	let { layerId = $bindable(), defaultHaloWidth = $bindable(1) }: Props = $props();

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let propertyName = 'text-halo-width';
	let value = $state(
		style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultHaloWidth
	);
	let layerType = 'symbol';
	let maxValue = $state(10);
	let minValue = $state(0);
	let stepValue = $state(0.1);

	const setValue = () => {
		if (style.type !== layerType) return;
		map.setPaintProperty(layerId, propertyName, Number(value));
	};
	onMount(() => {
		setValue();
	});
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} onchange={setValue} />
