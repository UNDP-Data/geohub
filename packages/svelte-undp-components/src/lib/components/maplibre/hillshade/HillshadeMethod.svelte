<script module lang="ts">
	export const hillshadeMethodButtons: SegmentButton[] = [
		{ title: 'Standard', value: 'standard' },
		{ title: 'Basic', value: 'basic' },
		{ title: 'Combined', value: 'combined' },
		{ title: 'Igor', value: 'igor' },
		{ title: 'Multidirectional', value: 'multidirectional' }
	];
	export type HillshadeMethodType = 'standard' | 'basic' | 'combined' | 'igor' | 'multidirectional';
</script>

<script lang="ts">
	import SegmentButtons, { type SegmentButton } from '$lib/components/ui/SegmentButtons.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { getContext, onMount } from 'svelte';

	interface Props {
		layerId: string;
		defaultValue?: HillshadeMethodType;
		buttons?: SegmentButton[];
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

	const onValueChanged = (value: string | number) => {
		selectedValue = value as HillshadeMethodType;
		map.setPaintProperty(layerId, propertyName, value);
	};
</script>

<SegmentButtons {buttons} bind:selected={selectedValue} onchange={onValueChanged}></SegmentButtons>
