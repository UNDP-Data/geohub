<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import HeatmapIntensity from './HeatmapIntensity.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Heatmap/HeatmapIntensity',
		component: HeatmapIntensity,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Heatmap Intensity Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: HeatmapLayerSpecification = {
		id: 'heatmap-example',
		type: 'heatmap',
		source: 'carto',
		'source-layer': 'place',
		layout: {},
		paint: {
			'heatmap-intensity': 1
		}
	};
</script>

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
	import type { HeatmapLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
</script>

<Template let:args>
	<Map {title} {source} {layer}>
		<HeatmapIntensity {...args}></HeatmapIntensity>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: layer.id }} />
