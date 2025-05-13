<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { CircleLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import CircleRadius from './CircleRadius.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Circle/CircleRadius',
		component: CircleRadius,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Circle Radius Control';

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
			'circle-radius': 3
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<CircleRadius {...args}></CircleRadius>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id }} {template} />

<Story name="Readonly" args={{ layerId: layer.id, readonly: true }} {template} />

<Story name="Step value by 2" args={{ layerId: layer.id, stepValue: 2 }} {template} />
