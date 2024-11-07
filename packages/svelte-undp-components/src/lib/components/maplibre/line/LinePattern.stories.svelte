<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import LinePattern, { LineTypes } from './LinePattern.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Line/LinePattern',
		component: LinePattern,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

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

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
	import type { LineLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
</script>

<Template let:args>
	<Map {title} {source} {layer}>
		<LinePattern {...args}></LinePattern>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: layer.id }} />
