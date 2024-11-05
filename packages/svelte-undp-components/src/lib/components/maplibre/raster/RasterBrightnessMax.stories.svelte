<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import RasterBrightnessMax from './RasterBrightnessMax.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Raster/RasterBrightnessMax',
		component: RasterBrightnessMax,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Raster Brightness Max Control';

	const style = 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json';
</script>

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
	<Map {title} {style}>
		<RasterBrightnessMax {...args}></RasterBrightnessMax>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: 'bingaerial' }} />
