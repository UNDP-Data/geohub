<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import TextMaxWidth from './TextMaxWidth.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Symbol/TextMaxWidth',
		component: TextMaxWidth,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Text Max Width Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: SymbolLayerSpecification = {
		id: 'text-example',
		type: 'symbol',
		source: 'carto',
		'source-layer': 'place',
		minzoom: 2,
		maxzoom: 7,
		filter: ['all', ['==', 'class', 'country'], ['<=', 'rank', 2]],
		layout: {
			'text-field': '{name_en}',
			'text-font': ['Proxima Nova Bold'],
			'text-max-width': 5
		},
		paint: {}
	};
</script>

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
	import type { SymbolLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
</script>

<Template let:args>
	<Map {title} {source} {layer}>
		<TextMaxWidth {...args}></TextMaxWidth>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: layer.id }} />
