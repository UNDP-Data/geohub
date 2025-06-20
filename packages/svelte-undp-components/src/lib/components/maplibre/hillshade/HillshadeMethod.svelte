<script module lang="ts">
	export const hillshadeMethodButtons: Radio[] = [
		{ label: 'Standard', value: 'standard' },
		{ label: 'Basic', value: 'basic' },
		{ label: 'Combined', value: 'combined' },
		{ label: 'Igor', value: 'igor' },
		{ label: 'Multidirectional', value: 'multidirectional' }
	];
	export type HillshadeMethodType = 'standard' | 'basic' | 'combined' | 'igor' | 'multidirectional';
</script>

<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { Radios, type Radio } from '@undp-data/svelte-undp-design';
	import { getContext, onMount } from 'svelte';

	interface Props {
		layerId: string;
		defaultValue?: HillshadeMethodType;
		buttons?: Radio[];
	}

	let {
		layerId = $bindable(),
		defaultValue = 'standard',
		buttons = hillshadeMethodButtons
	}: Props = $props();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const propertyName = 'hillshade-method';

	const getValue = (): string => {
		let v = $map.getPaintProperty(layerId, propertyName);
		if (!v) {
			v = defaultValue;
		}
		return v as HillshadeMethodType;
	};

	let selectedValue = $state(getValue());

	onMount(() => {
		selectedValue = getValue() as HillshadeMethodType;
		map.setPaintProperty(layerId, propertyName, selectedValue);
	});

	const onValueChanged = () => {
		map.setPaintProperty(layerId, propertyName, selectedValue);
	};
</script>

<Radios
	radios={buttons}
	groupName="hillshade-method"
	bind:value={selectedValue}
	onchange={onValueChanged}
	isVertical={true}
></Radios>
