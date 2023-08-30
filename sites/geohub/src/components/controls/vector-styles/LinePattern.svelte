<script lang="ts">
	import { Radios, type Radio } from '@undp-data/svelte-undp-design';
	import { isEqual, sortBy } from 'lodash-es';
	import type { LayerSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';

	import { LineTypes } from '$lib/config/AppConfig/LineTypes';
	import type { Layer } from '$lib/types';
	import { map } from '$stores';

	export let layer: Layer;
	export let defaultColor: string = undefined;

	const propertyName = 'line-dasharray';
	const layerId = layer.id;

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let linePatternColorRgba = defaultColor;
	let lineType = (
		style?.paint[propertyName]
			? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
			  // @ts-ignore
			  LineTypes.find((item) => isEqual(sortBy(item.value), sortBy(style.paint[propertyName])))
			: LineTypes.find((item) => item.title === 'solid')
	).title;

	$: lineType, setLineType();

	const setLinePatterns = () => {
		const pattern: Radio[] = LineTypes.map((type) => {
			const label = `
          ${type.title}
          <span
            style="font-family: monospace;position:relative;left: 10px;top:-4px;position:relative;font-weight: bold;">
            ${type.pattern}
          </span>`;

			return {
				label: label,
				value: type.title
			};
		});
		return pattern;
	};

	let linePatterns: Radio[] = setLinePatterns();

	onMount(() => {
		if (!$map) return;
		$map.on('line-color:changed', () => {
			linePatternColorRgba = defaultColor;
		});
	});

	const setLineType = () => {
		if (style?.type !== 'line' || lineType === undefined) return;

		const value = LineTypes.find((item) => item.title === lineType).value;
		if (value) {
			map.setPaintProperty(layer.id, propertyName, value);
		} else {
			map.setPaintProperty(layer.id, propertyName, undefined);
		}
	};
</script>

<div class="line-pattern-view-container" data-testid="line-pattern-view-container">
	{#key linePatternColorRgba}
		<Radios
			bind:radios={linePatterns}
			bind:value={lineType}
			allowHtml={true}
			groupName="line-pattern-{layer.id}"
			isVertical={true}
		/>
	{/key}
</div>

<style lang="scss">
	.line-pattern-view-container {
		width: 100%;
	}
</style>
