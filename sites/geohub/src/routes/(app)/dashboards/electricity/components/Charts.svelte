<script lang="ts">
	import { page } from '$app/state';
	import { getBase64EncodedUrl } from '$lib/helper';
	import { LineChart, ScaleTypes, type LineChartOptions } from '@carbon/charts-svelte';
	import '@carbon/charts-svelte/styles.css';
	import { Notification } from '@undp-data/svelte-undp-components';
	import { getContext, onMount } from 'svelte';
	import { admin, hrea, map } from '../stores';
	import {
		ELECTRICITY_DATATYPE_CONTEXT_KEY,
		type ElectricityDataTypeStore
	} from '../stores/electricityDataType';

	const electricityDataType: ElectricityDataTypeStore = getContext(
		ELECTRICITY_DATATYPE_CONTEXT_KEY
	);

	let minYear = $state(electricityDataType[0]);
	let maxYear = $state(electricityDataType[1]);

	const titilerUrl = page.data.titilerUrl;

	const HREA_ID = 'HREA';

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

						const values: number[] = carbonChartData.map((d) => d.value);
						const max = Math.max(...values);
						if (max <= 1 && value <= 1) {
							value = e * 100;
						}
						return `${value.toFixed(0)}%`;
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
					const values: number[] = carbonChartData.map((d) => d.value);
					const max = Math.max(...values);
					if (max <= 1 && value <= 1) {
						value = value * 100;
					}
					return `${Number(value).toFixed(2)}%`;
				}
			}
		},
		height: '310px'
	};

	let controller = new AbortController();
	let adminBarValues: number[] = [];
	let pointBarValues: number[] = [];
	let carbonChartData = $state([]);
	let pointLocation = $state('');

	const loadInteraction = () => {
		if (!$map) return;
		else pointInteraction();
	};

	const getHreaUrl = (y: number) => {
		const dataset = $hrea?.find((ds) => ds.year === y);
		const url: string = dataset?.url ?? '';
		return getBase64EncodedUrl(url);
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

{#if carbonChartData?.length > 0}
	<br />
	<div class="title-text">Likelihood of full electrification at</div>
	<div class="title-text stats-location">{pointLocation}</div>
	<LineChart data={carbonChartData} options={carbonChartOptions} style="height: 310px;" />
{:else}
	<div class="mt-2">
		<Notification type="info" showCloseButton={false}
			>Click anywhere on map to get statistics</Notification
		>
	</div>
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
</style>
