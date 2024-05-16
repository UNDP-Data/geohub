<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Slider } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import type { LayerSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;

	export let defaultValue: number;
	export let maxValue: number;
	export let minValue: number;
	export let propertyName: string;
	export let propertyType: 'paint' | 'layout' = 'paint';
	export let stepValue: number;
	export let suffix = '';

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

	let values = [getValue()];

	$: values, setValue();

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
/>
