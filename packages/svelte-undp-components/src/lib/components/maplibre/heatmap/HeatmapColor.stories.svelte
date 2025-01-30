<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { HeatmapLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import HeatmapColor from './HeatmapColor.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Heatmap/HeatmapColor',
		component: HeatmapColor,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Heatmap Color Control';

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
		paint: {}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<HeatmapColor {...args}></HeatmapColor>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id }} children={template} />
