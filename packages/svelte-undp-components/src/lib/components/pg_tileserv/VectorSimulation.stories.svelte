<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { FillLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../maplibre/Map.svelte';
	import VectorSimulation from './VectorSimulation.svelte';

	const { Story } = defineMeta({
		title: 'Components/pg_tileserv/VectorSimulation',
		component: VectorSimulation,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Vector Simulation Control';
	const sourceUrl =
		'https://pgtileserv.undpgeohub.org/admin.dynamic_subnational_hdi/{z}/{x}/{y}.pbf';

	const source: VectorSourceSpecification = {
		type: 'vector',
		tiles: [sourceUrl],
		attribution: 'United Nations Development Programme (UNDP)'
	};

	const layer: FillLayerSpecification = {
		id: '76966022-48e3-4d3b-ad9e-4da6d697c16c',
		type: 'fill',
		source: 'e187d609-294a-4c75-ba01-a7876765225a',
		'source-layer': 'admin.dynamic_subnational_hdi',
		minzoom: 0,
		layout: {
			visibility: 'visible'
		},
		paint: {
			'fill-color': [
				'case',
				['has', 'hdi'],
				[
					'step',
					['get', 'hdi'],
					'#a50026',
					0.38,
					'#f46d43',
					0.53,
					'#fee08b',
					0.69,
					'#d9ef8b',
					0.84,
					'#66bd63'
				],
				'rgba(0,0,0,0)'
			],
			'fill-outline-color': 'rgba(0,0,0,1)',
			'fill-opacity': 1
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<VectorSimulation {...args}></VectorSimulation>
	</Map>
{/snippet}

<Story
	name="Primary"
	args={{
		layerId: layer.id,
		datasetUrl: sourceUrl
	}}
	{template}
/>
