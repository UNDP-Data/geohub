<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import HillshadeShadowColor from './HillshadeShadowColor.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Hillshade/HillshadeShadowColor',
		component: HillshadeShadowColor,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Hillshade Shadow Color Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
	};

	const layer: HillshadeLayerSpecification = {
		id: 'hillshade-example',
		type: 'hillshade',
		source: 'terrarium',
		layout: {},
		paint: {
			'hillshade-shadow-color': 'hsl(39, 21%, 33%)',
			'hillshade-illumination-direction': 315,
			'hillshade-exaggeration': 0.8
		}
	};
</script>

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
	import type { HillshadeLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
</script>

<Template let:args>
	<Map {title} {source} {layer}>
		<HillshadeShadowColor {...args}></HillshadeShadowColor>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: layer.id }} />
