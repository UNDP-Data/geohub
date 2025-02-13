<script lang="ts" module>
	export interface LineType {
		title: string;
		value: string | number[];
		pattern: string;
	}

	export const LineTypes: LineType[] = [
		{ title: 'solid', value: '', pattern: '___________' },
		{ title: 'dash', value: [10, 4], pattern: '___&nbsp;&nbsp;___&nbsp;&nbsp;___' },
		{ title: 'dash-dot', value: [10, 3, 2, 3], pattern: '___&nbsp;_&nbsp;___&nbsp;' },
		{ title: 'dot', value: [1, 5, 1], pattern: '_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_&nbsp;_' }
	];
</script>

<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$lib/stores';
	import { Radios, type Radio } from '@undp-data/svelte-undp-design';
	import { isEqual, sortBy } from 'lodash-es';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		layerId: string;
	}

	let { layerId = $bindable() }: Props = $props();

	const propertyName = 'line-dasharray';

	const style = $map
		.getStyle()
		.layers.filter((layer: LayerSpecification) => layer.id === layerId)[0];

	let lineType = $state(
		(style?.paint[propertyName]
			? LineTypes.find((item) => isEqual(sortBy(item.value), sortBy(style.paint[propertyName])))
			: LineTypes.find((item) => item.title === 'solid')
		)?.title
	);

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

	let linePatterns: Radio[] = $state(setLinePatterns());

	const setLineType = () => {
		if (style?.type !== 'line' || lineType === undefined) return;

		const value = LineTypes.find((item) => item.title === lineType)?.value;
		if (value) {
			map.setPaintProperty(layerId, propertyName, value);
		} else {
			map.setPaintProperty(layerId, propertyName, undefined);
		}
	};
	onMount(() => {
		setLineType();
	});
</script>

<div class="line-pattern-view-container" data-testid="line-pattern-view-container">
	<Radios
		bind:radios={linePatterns}
		bind:value={lineType as string}
		allowHtml={true}
		groupName="line-pattern-{layerId}"
		isVertical={true}
		onchange={setLineType}
	/>
</div>

<style lang="scss">
	.line-pattern-view-container {
		width: 100%;
	}
</style>
