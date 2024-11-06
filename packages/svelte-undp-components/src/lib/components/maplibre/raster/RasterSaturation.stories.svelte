<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import RasterSaturation from './RasterSaturation.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Raster/RasterSaturation',
		component: RasterSaturation,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Raster Saturation Control';

	const style = 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json';
</script>

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
	<Map {title} {style}>
		<RasterSaturation {...args}></RasterSaturation>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: 'bingaerial' }} />
