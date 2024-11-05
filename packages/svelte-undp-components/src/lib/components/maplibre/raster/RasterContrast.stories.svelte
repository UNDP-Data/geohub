<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import RasterContrast from './RasterContrast.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Raster/RasterContrast',
		component: RasterContrast,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Raster Contrast Control';

	const style = 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json';
</script>

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
	<Map {title} {style}>
		<RasterContrast {...args}></RasterContrast>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: 'bingaerial' }} />
