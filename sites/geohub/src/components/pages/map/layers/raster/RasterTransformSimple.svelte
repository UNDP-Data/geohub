<script context="module" lang="ts">
	interface RasterExpression {
		band: string;
		operator?: string;
		operatorLabel?: string;
		value?: number[];
	}
</script>

<script lang="ts">
	import Step from '$components/util/Step.svelte';
	import Wizard from '$components/util/Wizard.svelte';
	import { RasterComparisonOperators } from '$lib/config/AppConfig';
	import {
		fetchUrl,
		getActiveBandIndex,
		getLayerSourceUrl,
		getLayerStyle,
		loadMap,
		updateParamsInURL
	} from '$lib/helper';
	import type { BandMetadata, Layer, RasterLayerStats, RasterTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Notification, initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { getContext, onMount } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const tippyTooltip = initTooltipTippy();

	let originalRasterFilterUrl: URL = undefined;
	let initialRasterFilterStep = 1;
	let expressionApplied = false;
	let layerMin: number;
	let layerMax: number;
	let layerMedian: number;

	let info: RasterTileMetadata = layer.info;
	let statistics: RasterLayerStats;
	let step: number;

	const bandIndex = getActiveBandIndex(info); //normally info should be called as well

	//necessary to create Slider
	const band = info.active_band_no;
	if (info.stats) {
		layerMin = info.stats[band].min;
		layerMax = info.stats[band].max;
	} else {
		const bandMetaStats = info['band_metadata'][bandIndex][1] as BandMetadata;
		layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);
		layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);
	}

	/*
        Expression object consisting of a band property and expressions property. The expressions is an object where the key or property name
        and the values is as number set by the user either using  the numbers interface or the range slider binded to the layer min max
    */
	const emptyExpression: RasterExpression = {
		band: undefined,
		operator: undefined,
		operatorLabel: undefined,
		value: [(layerMax - layerMin) * 0.5]
	};
	let expression: RasterExpression = { ...emptyExpression };

	onMount(async () => {
		await loadMap($map);
		const url: string = getLayerSourceUrl($map, layer.id) as string;

		const urlObj = new URL(url);
		const expressionParam = urlObj.searchParams.get('expression');
		if (expressionParam) {
			// if expression is defined in source URL, restore expression
			urlObj.searchParams.delete('expression');
			urlObj.searchParams.delete('nodata');
			const split = expressionParam.replace('where(', '').replace(');', '').split(',');
			const values = split[0].split(' ');
			const operator = values[1];
			const value = Number(values[2]);
			expression = {
				band: split[1].trim(),
				operator: operator,
				operatorLabel:
					RasterComparisonOperators.find((o) => o.value === operator)?.text ?? undefined,
				value: [value]
			};
			expressionApplied = true;
		}
		originalRasterFilterUrl = urlObj;

		if (!('stats' in info)) {
			const statsURL = layer.dataset.properties.links.find((l) => l.rel === 'statistics').href;
			statistics = (await fetchUrl(statsURL)) as unknown as RasterLayerStats;
			info = { ...info, stats: statistics };
		}

		const band = info.active_band_no;
		layerMin = Number(info.stats[band].min);
		layerMax = Number(info.stats[band].max);
		layerMedian = Number(info.stats[band].median);

		// this ensures the slider state is set to layer min max
		const range = layerMax - layerMin;
		step =
			Number.isInteger(layerMedian) && Number.isInteger(layerMin)
				? ~~(range * 1e-4) || 1
				: range * 1e-4;
	});

	const removeExpression = () => {
		updateParamsInURL(getLayerStyle($map, layer.id), originalRasterFilterUrl, {}, map);
		expressionApplied = false;
		expression = { ...emptyExpression };
	};

	const applyExpression = async () => {
		let newParams = {};
		const expressionStringValue = `${[expression.band, expression.operator, expression.value[0]].join(' ')}`;
		const NO_DATA = -9999;
		newParams['expression'] = `where(${expressionStringValue}, ${expression.band}, ${NO_DATA});`;
		newParams['nodata'] = NO_DATA;

		const url: string = getLayerSourceUrl($map, layer.id) as string;
		const lURL = new URL(url);

		updateParamsInURL(getLayerStyle($map, layer.id), lURL, newParams, map);
		expressionApplied = true;
	};

	const clearState = () => {
		initialRasterFilterStep = 1;
	};

	const cancel = () => {
		clearState();
		expression = { ...emptyExpression };
	};

	const onSliderStop = (event: CustomEvent) => {
		expression = { ...expression, value: [event.detail.value] };
	};
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css"
	/>
</svelte:head>

<Wizard initialStep={initialRasterFilterStep}>
	<Step num={1} let:nextStep>
		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center"
		>
			<div hidden={expressionApplied}>
				<button
					on:click={() => {
						nextStep();
						initialRasterFilterStep = 2;
						expression = { ...expression, band: band };
					}}
					class="button is-primary is-small is-uppercase has-text-weight-bold"
				>
					ADD
				</button>
			</div>

			{#if expressionApplied}
				<div class="dropdown is-hoverable">
					{#if expression}
						<div class="tags has-addons is-centered">
							<div class="tag is-info is-dark is-small">{`${expression.band}`}</div>
							<div class="tag is-danger is-dark is-small">{expression.operator}</div>
							<div class="tag is-success is-dark is-small">{expression.value[0]}</div>
						</div>
					{/if}
				</div>

				<button
					on:click={removeExpression}
					class="button is-primary is-small is-uppercase has-text-weight-bold ml-auto"
				>
					Clear filter
				</button>
			{/if}
		</div>
		{#if !expressionApplied}
			<div class="mt-2">
				<Notification type="info" showCloseButton={false}>
					Create an <b>expression</b> and tranform the current layer's pixels values based on
					whether they <b>satisfy</b> or
					<b>not</b>
					a <b>condition</b>.
				</Notification>
			</div>
		{/if}
	</Step>
	<Step num={2} let:nextStep let:setStep let:prevStep>
		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center"
		>
			<button
				on:click={() => {
					prevStep();
					initialRasterFilterStep = 1;
				}}
				title="move back to start"
				class="button is-link is-small is-uppercase has-text-weight-bold"
			>
				<i class="fa fa-angles-left" /> &nbsp;Back
			</button>

			<button
				on:click={() => {
					setStep(1);
					cancel();
				}}
				class="button is-link is-small is-uppercase has-text-weight-bold"
			>
				Cancel
			</button>
		</div>

		<div class="mt-2">
			<Notification type="info" showCloseButton={false}>
				show only pixels whose value is {expression.operatorLabel ?? ''}
			</Notification>
		</div>

		<div class="grid mt-2">
			{#each RasterComparisonOperators as operator}
				{@const isVisible = !operator.disabled}
				{#if isVisible}
					<button
						class="button {operator.value === expression.operator ? 'is-success' : 'is-info'}"
						on:click={() => {
							expression = {
								...expression,
								operator: operator.value,
								operatorLabel: operator.text
							};
							initialRasterFilterStep = 3;

							nextStep();
						}}
						title={operator.text}
						use:tippyTooltip={{ content: operator.label }}
					>
						<div class="is-flex is-justify-content-center">
							<span class="has-text-white-ter has-text-weight-bold is-size-4"
								>{operator.symbol}</span
							>
						</div>
					</button>
				{/if}
			{/each}
		</div>
	</Step>
	<Step num={3} let:setStep let:prevStep>
		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center"
		>
			<button
				on:click={() => {
					prevStep();
					initialRasterFilterStep = 2;
				}}
				title="Operator categories"
				class="button is-link is-small is-uppercase has-text-weight-bold"
			>
				<i class="fa fa-angles-left" /> &nbsp;Operator
			</button>

			<button
				on:click={() => {
					cancel();
					setStep(1);
				}}
				class="button is-link is-small is-uppercase has-text-weight-bold"
			>
				Cancel
			</button>
		</div>

		<div class="mt-2">
			<Notification type="info" showCloseButton={false}>
				show only pixels whose value is {expression.operatorLabel ?? ''}
				{expression.value[0] ?? ''}
			</Notification>
		</div>

		<div class="container mt-2">
			<div class="range-slider">
				<RangeSlider
					bind:values={expression.value}
					float
					pips={step}
					min={layerMin}
					max={layerMax}
					{step}
					range="min"
					first="label"
					last="label"
					rest={false}
					on:stop={onSliderStop}
				/>
			</div>
		</div>

		<button
			on:click={() => {
				clearState();
				setStep(1);
				applyExpression();
			}}
			disabled={expression?.operator && expression?.value ? false : true}
			class="button is-primary is-small is-uppercase has-text-weight-bold mt-2"
		>
			Apply
		</button>
	</Step>
</Wizard>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 5px;
	}

	.range-slider {
		--range-handle-focus: #2196f3;
		--range-handle-inactive: #2196f3;
		--range-handle: #2196f3;
		--range-range-inactive: #2196f3;
		margin: 0;
	}
</style>
