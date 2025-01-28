<script lang="ts" module>
	import type { RasterTileMetadata } from '$lib/interfaces/RasterTileMetadata.js';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
	import Map from '../maplibre/Map.svelte';
	import RasterClassifyLegend from './RasterClassifyLegend.svelte';

	const { Story } = defineMeta({
		title: 'Components/titiler/RasterClassifyLegend',
		component: RasterClassifyLegend,
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Raster Classify Legend Control';

	// SAS token of blob storage will be expired every year.
	// if it is expired, please update it for the below dataset.
	// https://geohub.data.undp.org/data/00d5add9be37e465398b081683c3ec03#Info
	const source: RasterSourceSpecification = {
		type: 'raster',
		tiles: [
			'https://titiler-dev.undpgeohub.org/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=https%3A%2F%2Fundpgeohub.blob.core.windows.net%2Fuserdata%2Fa85516c81c0b78d3e89d3f00099b8b15%2Fdatasets%2FDem_Rwanda_10m_allt_20230921150153.tif%2FDem_Rwanda_10m_allt_20230921150153_band1.tif%3Fc3Y9MjAyNS0wMS0wNSZzcz1iJnNydD1vJnNlPTIwMjUtMTItMDVUMDclM0EzMSUzQTQyWiZzcD1yJnNpZz13OU9BSEpBVlZBV2tuQ0drNFB6TzQ1TXNoTEZBWmclMkJONVRsU01Wa0pnZFElM0Q%3D&scale=1&bidx=1&resampling=nearest&return_mask=true&colormap=[[[1085%2C1466.47]%2C[84%2C48%2C5%2C255]]%2C[[1466.47%2C1661.19]%2C[174%2C113%2C33%2C255]]%2C[[1661.19%2C1875.42]%2C[231%2C207%2C148%2C255]]%2C[[1875.42%2C2177.06]%2C[245%2C245%2C245%2C255]]%2C[[2177.06%2C2712.56]%2C[152%2C215%2C205%2C255]]%2C[[2712.56%2C4123.01]%2C[36%2C135%2C127%2C255]]]'
		],
		tileSize: 256,
		maxzoom: 14,
		bounds: [28.959287045881197, -2.84147961176665, 30.899474003347827, -1.0399102179189348],
		attribution: 'Water and Sanitation Corporation (WASAC),National Land Authority (NLA)'
	};

	const layer: RasterLayerSpecification = {
		id: '309a3cde-3198-4e73-9125-ac3f68cd3fe9',
		type: 'raster',
		source: '309a3cde-3198-4e73-9125-ac3f68cd3fe9',
		minzoom: 0,
		layout: {
			visibility: 'visible'
		},
		paint: {
			'raster-resampling': 'nearest',
			'raster-opacity': 1,
			'raster-brightness-max': 1,
			'raster-brightness-min': 0,
			'raster-contrast': 0,
			'raster-hue-rotate': 0,
			'raster-saturation': 0
		}
	};

	const metadata: RasterTileMetadata = {
		bounds: [28.959287045881197, -2.84147961176665, 30.899474003347827, -1.0399102179189348],
		minzoom: 7,
		maxzoom: 14,
		band_metadata: [
			[
				'b1',
				{
					LAYER_TYPE: 'athematic',
					STATISTICS_MAXIMUM: 4123,
					STATISTICS_MEAN: 1704.13467729204,
					STATISTICS_MINIMUM: 100,
					STATISTICS_STDDEV: 357.8873088815601,
					STATISTICS_MEDIAN: 1605,
					STATISTICS_UNIQUE_VALUES: {}
				}
			]
		],
		band_descriptions: [['b1', 'Layer_1']],
		dtype: 'uint16',
		nodata_type: 'Nodata',
		colorinterp: ['gray'],
		scales: [1],
		offsets: [0],
		driver: 'GTiff',
		count: 1,
		width: 21517,
		height: 19992,
		overviews: [2, 4, 8, 16, 32, 64, 128],
		nodata_value: 0,
		stats: {
			b1: {
				min: 100,
				max: 4123,
				mean: 1704.13467729204,
				count: 582756,
				sum: 993094708,
				std: 357.8873088815601,
				median: 1605,
				majority: 1462,
				minority: 100,
				unique: 2899,
				histogram: [
					[21, 15, 28832, 326202, 140385, 71575, 13629, 991, 759, 347],
					[
						100, 502.3, 904.6, 1306.9, 1709.2, 2111.5, 2513.8, 2916.1, 3318.4, 3720.7000000000003,
						4123
					]
				],
				valid_percent: 59.78,
				masked_pixels: 392092,
				valid_pixels: 582756,
				percentile_2: 1288,
				percentile_98: 2558
			}
		},
		active_band_no: 'b1'
	};
</script>

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<RasterClassifyLegend {...args}></RasterClassifyLegend>
	</Map>
{/snippet}

<Story
	name="Primary"
	args={{
		layerId: layer.id,
		metadata: metadata,
		colorMapName: 'brbg',
		numberOfClasses: 6
	}}
	tags={['autodocs']}
	children={template}
/>
