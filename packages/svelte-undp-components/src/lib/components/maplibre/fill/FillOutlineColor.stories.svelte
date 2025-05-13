<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { FillLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import FillOutlineColor from './FillOutlineColor.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Fill/FillOutlineColor',
		component: FillOutlineColor,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Fill Outline Color Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: FillLayerSpecification = {
		id: 'fill-example',
		type: 'fill',
		source: 'carto',
		'source-layer': 'water',
		layout: {},
		paint: {
			'fill-color': 'rgba(255,255,255,1)',
			'fill-outline-color': 'rgba(255,0,0,1)'
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<FillOutlineColor {...args}></FillOutlineColor>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id }} {template} />
