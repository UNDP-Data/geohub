<script lang="ts">
	import { page } from '$app/stores';
	import { getBase64EncodedUrl } from '$lib/helper';
	import { LineChart, ScaleTypes, type LineChartOptions } from '@carbon/charts-svelte';
	import '@carbon/charts-svelte/styles.css';
	import { type SegmentButton } from '@undp-data/svelte-undp-components';
	import { format } from 'd3-format';
	import { getContext, onMount } from 'svelte';
	import { admin, hrea, map } from '../stores';
	import {
		ELECTRICITY_DATATYPE_CONTEXT_KEY,
		type ElectricityDataTypeStore
	} from '../stores/electricityDataType';

	const electricityDataType: ElectricityDataTypeStore = getContext(
		ELECTRICITY_DATATYPE_CONTEXT_KEY
	);

	let minYear = electricityDataType[0];
	let maxYear = electricityDataType[1];

	const titilerUrl = $page.data.titilerUrl;

	const HREA_ID = 'HREA';
	const HOVER = 'hover';
	const CLICK = 'click';

	const HREA_NODATA = 254;

	const carbonChartOptions: LineChartOptions = {
		title: '',
		axes: {
			bottom: {
				title: 'Year',
				mapsTo: 'year',
				scaleType: ScaleTypes.LABELS
			},
			left: {
				mapsTo: 'value',
				title: 'Electrification',
				scaleType: ScaleTypes.LINEAR,
				ticks: {
					formatter: (e) => {
						let value = e;
						if (value <= 1) {
							value = e * 100;
						}
						return `${value}%`;
					}
				}
			}
		},
		// toolbar: {
		// 	enable: false
		// },
		tooltip: {
			showTotal: false,
			valueFormatter: (value, label) => {
				if (label === 'Year') {
					return value;
				} else {
					return `${(value * 100).toFixed(2)}%`;
				}
			}
		},
		height: '310px'
	};
	const interactChoices: SegmentButton[] = [{ value: CLICK, title: CLICK }];

	let interactSelected = interactChoices[0].value;
	let controller = new AbortController();
	let adminBarValues = [];
	let pointBarValues = [];
	let carbonChartData = [];
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

	const adminInteraction = () => {
		adminBarValues = [];
		carbonChartData = [];
		adminLocation = '';
		$map.off('click', onPointClick);
		$map.on('mousemove', renderAdminCharts);
	};

	const pointInteraction = () => {
		pointBarValues = [];
		carbonChartData = [];
		pointLocation = '';
		$map.on('click', onPointClick);
		$map.off('mousemove', renderAdminCharts);
	};

	const onPointClick = (e) => {
		const { lng, lat } = $map.unproject(e.point);
		const options = [[HREA_ID, getHreaUrl, HREA_NODATA, [], 1]];
		pointBarValues = [];
		carbonChartData = [];
		pointLocation = `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`;
		controller.abort();
		controller = new AbortController();
		for (const [name, getDataURL, noData, ignoreValue, total] of options) {
			for (let x = minYear; x <= maxYear; x++) {
				if (!ignoreValue.includes(x)) {
					const url = `${titilerUrl}/point/${lng},${lat}?url=${getDataURL(x)}&unscale=true`;
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
							carbonChartData = [
								...carbonChartData,
								{
									group: name,
									year: x.toString(),
									value: responseValue
								}
							];

							carbonChartData = [
								...carbonChartData.sort((a, b) => {
									if (a.year < b.year) {
										return -1;
									}
									if (a.year > b.year) {
										return 1;
									}
									return 0;
								})
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
		carbonChartData = [];
		for (let i = maxYear; i >= minYear; i--) {
			adminBarValues = [
				...adminBarValues,
				{ year: i, value: $admin[`hrea_${i}`], category: HREA_ID }
			];
			carbonChartData = [
				...carbonChartData,
				{ year: i.toString(), value: $admin[`hrea_${i}`], group: HREA_ID }
			];

			carbonChartData = [
				...carbonChartData.sort((a, b) => {
					if (a.year < b.year) {
						return -1;
					}
					if (a.year > b.year) {
						return 1;
					}
					return 0;
				})
			];
		}
	};

	onMount(() => {
		electricityDataType.subscribe((value) => {
			minYear = value[0];
			maxYear = value[1];
			loadInteraction();
		});
	});
</script>

{#if interactSelected === HOVER}
	<br />
	<div class="title-text">Population fully electrified in</div>
	<div class="title-text stats-location">{adminLocation}</div>
	<LineChart data={carbonChartData} options={carbonChartOptions} style="height: 310px;" />
	<div class="subtitle-text">
		Population in 2022: {format('.3~s')($admin.pop).replace(/NaN.*/, '').replace('G', 'B')}
	</div>
{/if}
{#if interactSelected === CLICK}
	<br />
	<div class="title-text">Likelihood of full electrification at</div>
	<div class="title-text stats-location">{pointLocation}</div>
	<LineChart data={carbonChartData} options={carbonChartOptions} style="height: 310px;" />
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
