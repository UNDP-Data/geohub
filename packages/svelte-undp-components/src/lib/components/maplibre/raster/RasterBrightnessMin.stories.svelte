<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import RasterBrightnessMin from './RasterBrightnessMin.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Raster/RasterBrightnessMin',
		component: RasterBrightnessMin,
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
		<RasterBrightnessMin {...args}></RasterBrightnessMin>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: 'bingaerial' }} />
