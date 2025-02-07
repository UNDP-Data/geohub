<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Map from '../Map.svelte';
	import RasterBrightnessMin from './RasterBrightnessMin.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Raster/RasterBrightnessMin',
		component: RasterBrightnessMin,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Raster Brightness Max Control';

	const style = 'https://dev.undpgeohub.org/api/mapstyle/aerialstyle.json';
</script>

{#snippet template(args)}
	<Map {title} {style}>
		<RasterBrightnessMin {...args}></RasterBrightnessMin>
	</Map>
{/snippet}

<Story name="Primary" args={{ layerId: 'bingaerial' }} children={template} />
