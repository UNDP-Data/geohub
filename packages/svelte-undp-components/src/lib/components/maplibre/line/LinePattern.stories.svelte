<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { LineLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import LinePattern, { LineTypes } from './LinePattern.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Line/LinePattern',
		component: LinePattern,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Line pattern Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: LineLayerSpecification = {
		id: 'line-example',
		type: 'line',
		source: 'carto',
		'source-layer': 'boundary',
		layout: {},
		paint: {
			'line-color': 'rgba(255,0,0,1)',
			'line-dasharray': LineTypes[2].value as number[]
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<LinePattern {...args}></LinePattern>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id }} {template} />
