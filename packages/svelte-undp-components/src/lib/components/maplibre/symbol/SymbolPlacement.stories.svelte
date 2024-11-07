<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import SymbolPlacement from './SymbolPlacement.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Symbol/SymbolPlacement',
		component: SymbolPlacement,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Symbol Placement Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: SymbolLayerSpecification = {
		id: 'symbol-example',
		type: 'symbol',
		source: 'carto',
		'source-layer': 'boundary',
		layout: {
			'icon-image': 'circle'
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
		<SymbolPlacement {...args}></SymbolPlacement>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: layer.id }} />
