<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import IconOffset from './IconOffset.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Symbol/IconOffset',
		component: IconOffset,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Icon Offset Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: SymbolLayerSpecification = {
		id: 'symbol-example',
		type: 'symbol',
		source: 'carto',
		'source-layer': 'place',
		layout: {
			'icon-image': 'circle',
			'icon-size': 3
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
		<IconOffset {...args}></IconOffset>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: layer.id }} />
