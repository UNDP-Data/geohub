<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Map from '../Map.svelte';
	import TextFieldDecimalPosition from './TextFieldDecimalPosition.svelte';

	export const meta: Meta = {
		title: 'Components/Maplibre/Symbol/TextFieldDecimalPosition',
		component: TextFieldDecimalPosition,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	};

	const title = 'Text Field Decimal Position Control';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://geohub.data.undp.org/api/vector/pgtileserv/tile.json?table=admin.dynamic_subnational_hdi&type=function',
		attribution: 'United Nations Development Programme (UNDP)'
	};

	const layer: SymbolLayerSpecification = {
		id: 'c9fa0fae-638b-40dd-b19d-cf6e7d43fb0f-label',
		type: 'symbol',
		source: 'ae29ecad-1ade-48ea-82f7-f17a07b98503',
		'source-layer': 'admin.dynamic_subnational_hdi',
		layout: {
			'text-size': 16,
			'text-max-width': 10,
			'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
			'text-radial-offset': 0.5,
			'text-justify': 'auto',
			'text-font': ['Proxima Nova Regular'],
			'text-field': [
				'number-format',
				['get', 'hdi'],
				{
					'min-fraction-digits': 2,
					'max-fraction-digits': 2
				}
			],
			'symbol-placement': 'point',
			'icon-keep-upright': false,
			visibility: 'visible'
		},
		paint: {
			'text-color': 'rgb(0 0 0)',
			'text-halo-color': 'rgba(255,255,255,1)',
			'text-halo-width': 1
		}
	};

	const metadata = {
		name: 'admin.dynamic_subnational_hdi',
		version: '1.3.0',
		type: 'overlay',
		description: 'This is dynamic subnational HDI, please insert the desired increment values',
		attribution:
			'<a target="_top" rel="noopener" href="http://undp.org">United Nations Development Programme (UNDP)</a>',
		format: 'pbf',
		center: '0,0,0',
		bounds: '-180,-90,180,90',
		minzoom: 0,
		maxzoom: 22,
		json: {
			vector_layers: [
				{
					id: 'admin.dynamic_subnational_hdi',
					fields: {
						gdlcode: 'gdlcode',
						hdi: 'hdi',
						life_expectancy: 'life_expectancy',
						expected_years_schooling: 'expected_years_schooling',
						mean_years_schooling: 'mean_years_schooling',
						gross_national_income_per_capita: 'gross_national_income_per_capita'
					}
				}
			],
			tilestats: {
				layerCount: 1,
				layers: [
					{
						layer: 'admin.dynamic_subnational_hdi',
						geometry: 'Polygon',
						count: 1387,
						attributeCount: 6,
						attributes: [
							{
								attribute: 'hdi',
								type: 'number',
								count: 1387,
								min: 0.22349999845027924,
								max: 0.9934999942779541,
								mean: 0.7084735405578317,
								median: 0.7279000282287598,
								std: 0.1650763179170201,
								histogram: {
									count: [32, 219, 316, 469, 351],
									bins: [
										0.22349999845027924, 0.3774999976158142, 0.5314999967813492, 0.6854999959468842,
										0.8394999951124191, 0.9934999942779541
									]
								}
							}
						]
					}
				]
			}
		}
	};
</script>

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
	import type { SymbolLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
</script>

<Template let:args>
	<Map {title} {source} {layer}>
		<TextFieldDecimalPosition {...args}></TextFieldDecimalPosition>
	</Map>
</Template>

<Story name="Primary" args={{ layerId: layer.id, metadata: metadata }} />
