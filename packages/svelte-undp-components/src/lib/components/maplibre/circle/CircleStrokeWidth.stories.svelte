<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { CircleLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import CircleStrokeWidth from './CircleStrokeWidth.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Circle/CircleStrokeWidth',
		component: CircleStrokeWidth,
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Circle Stroke Width Control';

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
			'circle-radius': 5,
			'circle-stroke-width': 1
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<CircleStrokeWidth {...args}></CircleStrokeWidth>
	</Map>
{/snippet}

<Story name="Primary" tags={['autodocs']} args={{ layerId: layer.id }} children={template} />

<Story
	name="Step value by 2"
	tags={['autodocs']}
	args={{ layerId: layer.id, stepValue: 2 }}
	children={template}
/>
