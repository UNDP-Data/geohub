<script lang="ts">
	import Slider from '$lib/components/ui/Slider.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores/map.js';
	import { debounce } from 'lodash-es';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
		defaultValue: number;
		maxValue: number;
		minValue: number;
		propertyName: string;
		propertyType?: 'paint' | 'layout';
		stepValue: number;
		suffix?: string;
	}

	let {
		layerId = $bindable(),
		defaultValue = $bindable(),
		maxValue = $bindable(),
		minValue = $bindable(),
		propertyName = $bindable(),
		propertyType = $bindable('paint'),
		stepValue = $bindable(),
		suffix = $bindable('')
	}: Props = $props();

	const dispatch = createEventDispatcher();

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	const getValue = () => {
		let value =
			propertyType === 'paint'
				? $map.getPaintProperty(layerId, propertyName)
				: $map.getLayoutProperty(layerId, propertyName);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!value || (value && value.type === 'interval')) {
			value = defaultValue;
		}
		return Number(value);
	};

	let values = $state([getValue()]);

	const setValue = debounce(() => {
		const newStyle = JSON.parse(JSON.stringify(style));
		if (!newStyle[propertyType]) {
			newStyle[propertyType] = {};
		}
		newStyle[propertyType][propertyName] = values[0];

		if (propertyType === 'paint') {
			map.setPaintProperty(layerId, propertyName, values[0]);
		} else {
			map.setLayoutProperty(layerId, propertyName, values[0]);
		}

		dispatch('change', {
			value: values[0]
		});
	}, 300);

	onMount(() => {
		setValue();
	});
</script>

<Slider
	bind:values
	min={minValue}
	max={maxValue}
	step={stepValue}
	pips
	first="label"
	last="label"
	rest={false}
	{suffix}
	on:change={setValue}
/>
