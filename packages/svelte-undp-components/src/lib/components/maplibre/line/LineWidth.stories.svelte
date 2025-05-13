<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { LineLayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
	import Map from '../Map.svelte';
	import VectorValueClassification from '../util/VectorValueClassification.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Line/LineWidth',
		component: VectorValueClassification,
		tags: ['autodocs'],
		argTypes: {
			layerId: {
				type: 'string',
				description: 'Layer ID to edit'
			}
		}
	});

	const title = 'Line size Control';

	const defaultColor = 'rgba(255,0,0,1)';

	const source: VectorSourceSpecification = {
		type: 'vector',
		url: 'https://geohub.data.undp.org/api/vector/pgtileserv/tile.json?table=admin.dynamic_subnational_hdi&type=function',
		attribution: 'United Nations Development Programme (UNDP)'
	};

	const layer: LineLayerSpecification = {
		id: '76966022-48e3-4d3b-ad9e-4da6d697c16c',
		type: 'line',
		source: 'e187d609-294a-4c75-ba01-a7876765225a',
		'source-layer': 'admin.dynamic_subnational_hdi',
		minzoom: 0,
		layout: {
			visibility: 'visible'
		},
		paint: {
			'line-color': defaultColor,
			'line-width': 2
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
								attribute: 'gdlcode',
								type: 'string',
								count: 1387,
								values: [
									'AFGr101',
									'AFGr102',
									'AFGr103',
									'AFGr104',
									'AFGr105',
									'AFGr106',
									'AFGr107',
									'AFGr108',
									'AGOr201',
									'AGOr202',
									'AGOr203',
									'AGOr205',
									'AGOr206',
									'AGOr207',
									'AGOr208',
									'AGOr209',
									'AGOr210',
									'AGOr211',
									'AGOr212',
									'AGOr213',
									'AGOr214',
									'AGOr215',
									'AGOr216',
									'AGOr217',
									'AGOr218',
									'ALBr201',
									'ALBr206',
									'ALBr207',
									'ALBr208',
									'ALBr209',
									'AREt',
									'ARGr101',
									'ARGr102',
									'ARGr103',
									'ARGr104',
									'ARGr105',
									'ARGr106',
									'ARMr103',
									'ARMr104',
									'ARMr107',
									'ARMr109',
									'AUSr101',
									'AUSr102',
									'AUSr103',
									'AUSr104',
									'AUSr105',
									'AUSr106',
									'AUSr107',
									'AUTr102',
									'AUTr103',
									'AUTr104',
									'AUTr105',
									'AUTr106',
									'AUTr107',
									'AUTr108',
									'AZEr102',
									'AZEr103',
									'AZEr104',
									'AZEr106',
									'AZEr107',
									'AZEr108',
									'AZEr109',
									'BDIr103',
									'BELr102',
									'BELr103',
									'BELr104',
									'BELr105',
									'BELr106',
									'BELr108',
									'BELr109',
									'BELr110',
									'BENr101',
									'BENr103',
									'BENr105',
									'BENr106',
									'BFAr101',
									'BFAr102',
									'BFAr104',
									'BFAr105',
									'BFAr106',
									'BFAr107',
									'BFAr108',
									'BFAr109',
									'BFAr110',
									'BFAr112',
									'BFAr113',
									'BGDr201',
									'BGDr204',
									'BGDr207',
									'BGDr209',
									'BGDr211',
									'BGDr212',
									'BGDr214',
									'BGDr216',
									'BGDr217',
									'BGDr218',
									'BGDr219',
									'BGDr220',
									'BGDr221',
									'BGDr222'
								]
							},
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
							},
							{
								attribute: 'life_expectancy',
								type: 'number',
								count: 1387,
								min: 47.75,
								max: 85.41000366210938,
								mean: 72.00392221012129,
								median: 73.41999816894531,
								std: 8.009374013603306,
								histogram: {
									count: [43, 155, 317, 505, 367],
									bins: [
										47.75, 55.28200073242188, 62.814001464843756, 70.34600219726563,
										77.87800292968751, 85.41000366210939
									]
								}
							},
							{
								attribute: 'expected_years_schooling',
								type: 'number',
								count: 1387,
								min: 0.3700000047683716,
								max: 18,
								mean: 12.92257390481238,
								median: 13.3100004196167,
								std: 3.389077108841564,
								histogram: {
									count: [26, 69, 256, 544, 492],
									bins: [
										0.3700000047683716, 3.8960000038146974, 7.422000002861023, 10.94800000190735,
										14.474000000953675, 18
									]
								}
							},
							{
								attribute: 'mean_years_schooling',
								type: 'number',
								count: 1387,
								min: 0.3199999928474426,
								max: 14.800000190734863,
								mean: 8.179697193790874,
								median: 8.289999961853027,
								std: 3.4471257536249427,
								histogram: {
									count: [138, 277, 374, 335, 263],
									bins: [
										0.3199999928474426, 3.216000032424927, 6.112000072002411, 9.008000111579896,
										11.90400015115738, 14.800000190734863
									]
								}
							},
							{
								attribute: 'gross_national_income_per_capita',
								type: 'number',
								count: 1387,
								min: 673.219970703125,
								max: 92418,
								mean: 17188.892588158178,
								median: 10454.58984375,
								std: 18124.654954550235,
								histogram: {
									count: [976, 192, 143, 59, 17],
									bins: [
										673.219970703125, 19022.1759765625, 37371.13198242187, 55720.087988281244,
										74069.04399414062, 92418
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

{#snippet template(args)}
	<Map {title} {source} {layer}>
		<VectorValueClassification {...args}></VectorValueClassification>
	</Map>
{/snippet}

<Story
	name="Primary"
	args={{
		layerId: layer.id,
		metadata,
		defaultValue: 1,
		minValue: 0,
		maxValue: 10,
		stepValue: 0.1,
		propertyName: 'line-width',
		styleType: 'paint',
		legendCssTemplate: `margin-top: 13px; width: 40px; height: {value}px; background-color: ${defaultColor};`,
		dataLabel: 'Line width',
		numberOfClasses: 5,
		numberOfClassesMinimum: 2,
		numberOfClassesMaximum: 25,
		defaultNumberOfClasses: 5,
		classificationMethod: 'n',
		numberOfRandomSamplingPoints: 1000
	}}
	{template}
/>
