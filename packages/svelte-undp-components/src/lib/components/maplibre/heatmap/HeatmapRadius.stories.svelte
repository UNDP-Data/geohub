<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { HeatmapLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import HeatmapRadius from './HeatmapRadius.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Heatmap/HeatmapRadius',
		component: HeatmapRadius,
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Heatmap Radius Control';

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
			'heatmap-radius': 30
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<HeatmapRadius {...args}></HeatmapRadius>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id }} tags={['autodocs']} children={template} />
