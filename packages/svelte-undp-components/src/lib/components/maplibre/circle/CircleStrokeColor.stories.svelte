<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import CircleStrokeColor from './CircleStrokeColor.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Circle/CircleStrokeColor',
		component: CircleStrokeColor,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Circle Stroke Color Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: CircleLayerSpecification = {
		id: 'circle-example',
		type: 'circle',
		source: 'carto',
		'source-layer': 'place',
		layout: {},
		paint: {
			'circle-color': '#ff0000',
			'circle-stroke-color': '#000000',
			'circle-stroke-width': 3,
			'circle-radius': 10
		}
	};
</script>

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
	import type { CircleLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
</script>

<Template let:args>
	<Map {title} {source} {layer}>
		<CircleStrokeColor {...args}></CircleStrokeColor>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: layer.id }} />
