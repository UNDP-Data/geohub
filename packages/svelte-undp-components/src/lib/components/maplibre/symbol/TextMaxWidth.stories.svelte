<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { SymbolLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import TextMaxWidth from './TextMaxWidth.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Symbol/TextMaxWidth',
		component: TextMaxWidth,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

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

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<TextMaxWidth {...args}></TextMaxWidth>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: layer.id }} {template} />
