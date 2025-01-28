<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
	import Map from '../maplibre/Map.svelte';
	import RasterAlgorithms from './RasterAlgorithms.svelte';

	const { Story } = defineMeta({
		title: 'Components/titiler/RasterAlgorithms/Hillshade',
		component: RasterAlgorithms,
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			},
			algorithmId: {
				control: 'select',
				options: [
					'hillshade',
					'contours',
					'normalizedIndex',
					'terrarium',
					'terrainrgb',
					'rca',
					'flood_detection'
				],
				defaultValue: ''
			}
		}
	});

	const title = 'Raster Algorithms Control';

	const source: RasterSourceSpecification = {
		type: 'raster',
		tiles: [
			`https://titiler.undpgeohub.org/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=https%3A%2F%2Fs3.ap-northeast-1.wasabisys.com%2Fje-pds%2Fcog%2Fv1%2FJAXA.EORC_ALOS.PRISM_AW3D30.v3.2_global%2F2021-02%2F3%2FE034.00-E035.00%2FE034.00-S02.00-E035.00-S01.00-DSM.tiff&algorithm=hillshade`
		],
		tileSize: 256,
		minzoom: 0,
		maxzoom: 12,
		bounds: [34, -2, 35, -1],
		attribution: 'JAXA,JAXA EORC,JAXA EORC ALOS Group'
	};

	const layer: RasterLayerSpecification = {
		id: '89e38d53-528c-48ba-ad5c-72c71d392531',
		type: 'raster',
		source: '89e38d53-528c-48ba-ad5c-72c71d392531',
		minzoom: 0,
		layout: {
			visibility: 'visible'
		},
		paint: {
			'raster-resampling': 'nearest',
			'raster-opacity': 1
		}
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer} zoom={10} center={[34.5, -1.5]}>
		<RasterAlgorithms {...args}></RasterAlgorithms>
	</Map>
{/snippet}

<Story
	name="hillshade"
	args={{
		layerId: layer.id,
		algorithmsApi: 'https://titiler-dev.undpgeohub.org/algorithms',
		algorithmId: 'hillshade'
	}}
	tags={['autodocs']}
	children={template}
/>
