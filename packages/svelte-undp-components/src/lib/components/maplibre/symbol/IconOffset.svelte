<script lang="ts">
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	const propertyName = 'icon-offset';
	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let iconOffsetValues =
		style?.layout && style.layout[propertyName] ? style.layout[propertyName] : [0, 0];
	let maxValue = $state(10);
	let minValue = $state(-10);
	let step = $state(1);
	let xValue = $state(iconOffsetValues[0]);
	let yValue = $state(iconOffsetValues[1]);

	const setIconOffset = () => {
		iconOffsetValues = [xValue, yValue];
		map.setLayoutProperty(layerId, propertyName, iconOffsetValues);
	};
</script>

<div class="columns is-gapless" style="margin-bottom: 0;">
	<div class="column" title="Horizontal Offset">
		<div class="is-flex is-justify-content-center">Horizontal</div>
		<div class="is-flex is-justify-content-center">
			<NumberInput
				bind:value={xValue}
				bind:minValue
				bind:maxValue
				bind:step
				onchange={setIconOffset}
			/>
		</div>
	</div>
	<div class="column" title="Vertical Offset">
		<div class="is-flex is-justify-content-center">Vertical</div>
		<div class="is-flex is-justify-content-center">
			<NumberInput
				bind:value={yValue}
				bind:minValue
				bind:maxValue
				bind:step
				onchange={setIconOffset}
			/>
		</div>
	</div>
</div>
<div
	class="columns is-gapless is-size-7"
	style="padding-left: 5px; padding-bottom: 5px; padding-top: 5px;"
>
	<div class="column">Icon offset from center point</div>
</div>

<style lang="scss">
	div {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
</style>
