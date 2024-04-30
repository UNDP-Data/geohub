<script lang="ts">
	import { page } from '$app/stores';
	import { getBase64EncodedUrl } from '$lib/helper';
	import { SegmentButtons, type SegmentButton } from '@undp-data/svelte-undp-components';
	import { format } from 'd3-format';
	import type { VisualizationSpec } from 'svelte-vega';
	import { VegaLite } from 'svelte-vega';
	import { admin, hrea, map, ml } from '../stores';

	const titilerUrl = $page.data.titilerUrl;

	const HREA_ID = 'HREA';
	const ML_ID = 'ML';
	const HOVER = 'hover';
	const CLICK = 'click';

	const PRIMARY = '#1f77b4';
	const SECONDARY = '#ff7f0e';
	const GREY = '#808080';

	const HREA_NODATA = -3.3999999521443642e38;
	const ML_NODATA = 0;

	const vegaOptions = { actions: false, renderer: 'svg' };
	const interactChoices: SegmentButton[] = [
		{ value: HOVER, title: HOVER },
		{ value: CLICK, title: CLICK }
	];

	let interactSelected = interactChoices[0].value;
	let controller = new AbortController();
	let adminBarValues = [];
	let pointBarValues = [];
	let adminLocation = '';
	let pointLocation = '';

	$: interactSelected, loadInteraction();
	const loadInteraction = () => {
		if (!$map) return;
		if (interactSelected === HOVER) adminInteraction();
		else pointInteraction();
	};

	const getHreaUrl = (y: number) => {
		const dataset = $hrea?.find((ds) => ds.year === y);
		const url: string = dataset?.url ?? '';
		return getBase64EncodedUrl(url);
	};

	const getMlUrl = (y: number) => {
		const dataset = $ml?.find((ds) => ds.year === y);
		const url: string = dataset?.url ?? '';
		return getBase64EncodedUrl(url);
	};

	const adminInteraction = () => {
		adminBarValues = [];
		adminLocation = '';
		$map.off('click', onPointClick);
		$map.on('mousemove', renderAdminCharts);
	};

	const pointInteraction = () => {
		pointBarValues = [];
		pointLocation = '';
		$map.on('click', onPointClick);
		$map.off('mousemove', renderAdminCharts);
	};

	const onPointClick = (e) => {
		const { lng, lat } = $map.unproject(e.point);
		const options = [
			[HREA_ID, getHreaUrl, HREA_NODATA, [], 1],
			[ML_ID, getMlUrl, ML_NODATA, [2020], 255]
		];
		pointBarValues = [];
		pointLocation = `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`;
		controller.abort();
		controller = new AbortController();
		for (const [name, getDataURL, noData, ignoreValue, total] of options) {
			for (let x = 2012; x <= 2020; x++) {
				if (!ignoreValue.includes(x)) {
					const url = `${titilerUrl}/point/${lng},${lat}?url=${getDataURL(x)}`;
					fetch(url, { signal: controller.signal })
						.then((r) => r.json())
						.then((response) => {
							const responseValue = response.values[0] === noData ? 0 : response.values[0] / total;
							pointBarValues = [
								...pointBarValues,
								{
									category: name,
									year: x,
									value: responseValue
								}
							];
						});
				}
			}
		}
	};

	const renderAdminCharts = () => {
		adminLocation = [
			$admin.adm4_name,
			$admin.adm3_name,
			$admin.adm2_name,
			$admin.adm1_name,
			$admin.adm0_name
		]
			.filter(Boolean)
			.join(', ');
		adminBarValues = [];
		for (let i = 2020; i >= 2012; i--) {
			adminBarValues = [
				...adminBarValues,
				{ year: i, value: $admin[`hrea_${i}`], category: HREA_ID }
			];
		}
	};

	const getAdminSpec = (): VisualizationSpec => ({
		$schema: 'https://vega.github.io/schema/vega-lite/v5.json',
		padding: 0,
		width: 288,
		height: 120,
		view: { stroke: 'transparent' },
		background: null,
		data: { name: 'values' },
		layer: [
			{
				mark: { type: 'bar', cornerRadiusTopLeft: 5, cornerRadiusTopRight: 5 }
			},
			{
				mark: { type: 'text', align: 'center', baseline: 'middle', dy: -10 },
				encoding: {
					text: { field: 'value', type: 'quantitative', format: ',.0%' }
				}
			}
		],
		encoding: {
			x: {
				field: 'year',
				axis: { title: null, labelColor: GREY },
				scale: {
					domain: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020]
				}
			},
			y: {
				field: 'value',
				type: 'quantitative',
				axis: { title: null, grid: false, ticks: false, labels: false },
				scale: { domain: [0, 1] }
			},
			xOffset: { field: 'category' },
			color: {
				field: 'category',
				legend: { title: null, orient: 'bottom', labelColor: GREY },
				scale: {
					domain: [HREA_ID],
					range: [PRIMARY]
				}
			}
		}
	});

	const getPointSpec = (): VisualizationSpec => ({
		$schema: 'https://vega.github.io/schema/vega-lite/v5.json',
		padding: 0,
		width: 258,
		height: 120,
		view: { stroke: 'transparent' },
		background: null,
		data: { name: 'values' },
		mark: { type: 'bar', cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3 },
		encoding: {
			x: {
				field: 'year',
				axis: { title: null, labelColor: GREY },
				scale: {
					domain: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020]
				}
			},
			y: {
				field: 'value',
				type: 'quantitative',
				axis: {
					title: null,
					labelColor: GREY,
					ticks: false,
					tickCount: 5,
					grid: false,
					format: ',.0%'
				},
				scale: { domain: [0, 1] }
			},
			tooltip: { field: 'value', type: 'quantitative', format: ',.0%' },
			xOffset: { field: 'category' },
			color: {
				field: 'category',
				legend: { title: null, orient: 'bottom', labelColor: GREY, symbolType: 'circle' },
				scale: {
					domain: [HREA_ID, ML_ID],
					range: [PRIMARY, SECONDARY]
				}
			}
		}
	});
</script>

<div class="is-flex is-justify-content-center">
	<SegmentButtons
		buttons={interactChoices}
		size="normal"
		capitalized={true}
		bind:selected={interactSelected}
	/>
</div>

{#if interactSelected === HOVER}
	<br />
	<div class="title-text">Population fully electrified in</div>
	<div class="title-text stats-location">{adminLocation}</div>
	<br />
	<VegaLite data={{ values: adminBarValues }} spec={getAdminSpec()} options={vegaOptions} />
	<div class="subtitle-text">
		Population in 2022: {format('.3~s')($admin.pop).replace(/NaN.*/, '').replace('G', 'B')}
	</div>
{/if}
{#if interactSelected === CLICK}
	<br />
	<div class="title-text">Likelihood of full electrification at</div>
	<div class="title-text stats-location">{pointLocation}</div>
	<br />
	<VegaLite data={{ values: pointBarValues }} spec={getPointSpec()} options={vegaOptions} />
{/if}

<style lang="scss">
	.stats-location {
		min-height: 21px;
	}

	.title-text {
		font-size: 14px;
		color: rgb(1, 1, 1, 0.6);
		font-weight: normal;
	}

	.subtitle-text {
		font-size: 14px;
		color: #808080;
		font-weight: normal;
	}
</style>
