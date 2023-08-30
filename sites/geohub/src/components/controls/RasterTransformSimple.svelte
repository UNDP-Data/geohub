<script context="module" lang="ts">
	/* state variables used to keep the state of the wizard*/
	const originalRasterFilterUrl = {};
	let selectedRasterFilterOperator: { layerId?: string } = {};
	let rasterFilterExpressionApplied = {};
	let initialRasterFilterStep = {};
</script>

<script lang="ts">
	import Step from '$components/control-groups/Step.svelte';
	import Wizard from '$components/control-groups/Wizard.svelte';
	import { RasterComparisonOperators } from '$lib/config/AppConfig';
	import {
		fetchUrl,
		getActiveBandIndex,
		getLayerSourceUrl,
		getLayerStyle,
		updateParamsInURL
	} from '$lib/helper';
	import type {
		BandMetadata,
		Layer,
		RasterExpression,
		RasterLayerStats,
		RasterTileMetadata
	} from '$lib/types';
	import { map } from '$stores';
	import { onMount } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';

	export let layer: Layer;

	const layerId = layer.id;

	//operators
	let selectedOperator: string = selectedRasterFilterOperator?.layerId ?? undefined;

	let selectedOperatorLabel: string = undefined;

	/*
        Expression object consisting of a band property and expressions property. The expressions is an object where the key or property name
        and the values is as number set by the user either using  the numbers interface or the range slider binded to the layer min max
    */
	const emptyExpression: RasterExpression = {
		band: undefined,
		operator: undefined,
		value: undefined
	};
	let expression: RasterExpression = { ...emptyExpression };

	//state

	initialRasterFilterStep[layerId] = 1;

	let expressionApplied: boolean =
		layerId in rasterFilterExpressionApplied ? rasterFilterExpressionApplied[layerId] : false;
	console.log(`${rasterFilterExpressionApplied} ${expressionApplied}`);

	let layerMin: number;
	let layerMax: number;
	let layerMedian: number;

	let info: RasterTileMetadata;
	({ info } = layer);

	let statistics: RasterLayerStats;
	let step: number;

	const bandIndex = getActiveBandIndex(info); //normally info should be called as well

	//necessary to create Slider
	const band = info['band_metadata'][bandIndex][0] as string;
	const bandMetaStats = info['band_metadata'][bandIndex][1] as BandMetadata;

	layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);
	layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);

	const url: string = getLayerSourceUrl($map, layer.id) as string;
	const lURL = new URL(url);

	originalRasterFilterUrl[layer.id] = url;

	onMount(async () => {
		if (!('stats' in info)) {
			const statsURL = layer.dataset.properties.links.find((l) => l.rel === 'statistics').href;
			statistics = (await fetchUrl(statsURL)) as unknown as RasterLayerStats;
			info = { ...info, stats: statistics };
		}

		const band = Object.keys(info.stats)[bandIndex];
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

	let sliderBindValue: Array<number> = [(layerMax - layerMin) * 0.5];

	const removeExpression = () => {
		console.log(`clearing expression`);
		updateParamsInURL(getLayerStyle($map, layer.id), originalRasterFilterUrl[layer.id], {});
		rasterFilterExpressionApplied[layerId] = true;
	};

	const applyExpression = async () => {
		let newParams = {};

		const expressionStringValue = `b${Object.values(expression).join(' ')}`;

		//newParams['expression'] = `where(${expressionStringValue}, b${expression.band}, ${info.nodata_value ?? layerMax});`
		newParams['expression'] = `where(${expressionStringValue}, b${expression.band}, 0);`;
		console.log(newParams['expression']);
		// const exprStatUrl = new URL(
		//   `${lURL.protocol}//${lURL.host}/cog/statistics?url=${url}}&expression=${encodeURIComponent(
		//     newParams['expression'],
		//   )}`,
		// )
		newParams['rescale'] = [Number(info.stats[band].min), Number(info.stats[band].max)].join(',');

		// const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
		//console.log(JSON.stringify(exprStats, null, '\t'))
		updateParamsInURL(getLayerStyle($map, layer.id), lURL, newParams);
		expressionApplied = true;
		rasterFilterExpressionApplied[layerId] = true;
	};

	const clearState = () => {
		selectedOperator = undefined;
		selectedOperatorLabel = undefined;
		initialRasterFilterStep[layerId] = 1;
	};

	const cancel = () => {
		clearState();
		expression = { ...emptyExpression };
	};

	const onSliderStop = (event: CustomEvent) => {
		expression = { ...expression, value: event.detail.value };
	};

	let conditionExpressionButtonDisabled = true;
	// const uf = (k, v) => {
	//   return v ?? null
	// }
	$: {
		//console.clear()

		//console.log(`${JSON.stringify(expression, uf, '\t')} `)

		conditionExpressionButtonDisabled = expression?.operator && expression?.value ? false : true;
	}

	const handleEnterKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css"
	/>
</svelte:head>

<Wizard initialStep={initialRasterFilterStep[layerId]}>
	<Step num={1} let:nextStep>
		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pb-3"
		>
			<button
				on:click={() => {
					nextStep();
					initialRasterFilterStep[layerId] = 2;
					expression = { ...expression, band: band };
				}}
				class="button wizard-button is-small primary-button has-text-weight-bold"
			>
				<i class="fas fa-plus" />
				&nbsp; New
			</button>

			{#if expressionApplied}
				<button
					on:click={removeExpression}
					class="button wizard-button is-small primary-button has-text-weight-bold"
				>
					<i class="fas fa-trash" />&nbsp;Clear filter
				</button>
			{/if}
		</div>
		<div class="notification is-danger is-light has-text-centered p-1">
			Create an <b>expression</b> and tranform the current layer's pixels values based on whether
			they <b>satisfy</b> or
			<b>not</b>
			a <b>condition</b>.
		</div>
	</Step>
	<Step num={2} let:nextStep let:setStep let:prevStep>
		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pb-3"
		>
			<button
				on:click={() => {
					prevStep();
					initialRasterFilterStep[layerId] = 1;
				}}
				title="move back to start"
				class="button is-small secondary-button has-text-weight-bold"
			>
				<i class="fa fa-angles-left" /> &nbsp;Back
			</button>

			<button
				on:click={() => {
					setStep(1);
					cancel();
				}}
				class="button is-small primary-button has-text-weight-bold"
			>
				<i class="fa-solid fa-circle-xmark" /> &nbsp;Cancel
			</button>
		</div>

		<!-- <div class="card"> -->
		<div
			class="card-content p-5 m-0 is-size-6 is-family-primary is-uppercase has-text-danger-dark has-background-white-bis has-text-weight-semibold has-text-centered"
		>
			show only pixels whose value is {selectedOperatorLabel ?? ''}
		</div>

		<!-- </div> -->

		<div class="grid pt-5">
			{#each RasterComparisonOperators as operator}
				{@const isVisible = !operator.disabled}
				{#if isVisible}
					<div
						class="card is-info is-clickable has-text-centered"
						role="button"
						tabindex="0"
						on:keydown={handleEnterKey}
						on:click={() => {
							selectedOperator = operator.value;
							expression = { ...expression, operator: selectedOperator };
							selectedOperatorLabel = operator.text;
							initialRasterFilterStep[layerId] = 3;

							nextStep();
						}}
						title={operator.text}
					>
						<div
							class="card-header is-size-6 {operator.value === selectedOperator
								? 'has-background-success'
								: 'has-background-info-dark'} "
						>
							<span
								class="card-header-title is-centered is-v-centered {operator.value ===
								selectedOperator
									? 'has-text-white-ter'
									: 'has-text-white-ter'}  "
							>
								{#if operator.value === selectedOperator}
									<span class="icon">
										<i class="fa-solid fa-check" />
									</span>
								{/if}
								{operator.label}
							</span>
						</div>
						<div class="content">
							<div class="content is-size-2 p-0 m-0 has-text-weight-bold has-text-danger">
								{operator.symbol}
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</Step>
	<Step num={3} let:setStep let:prevStep>
		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pb-3"
		>
			<button
				on:click={() => {
					prevStep();
					initialRasterFilterStep[layerId] = 2;
				}}
				title="Operator categories"
				class="button is-small secondary-button has-text-weight-bold"
			>
				<i class="fa fa-angles-left" /> &nbsp;Change operator
			</button>
		</div>

		<!-- <div class="card"> -->
		<div
			class="content p-5 m-0 is-size-6 is-family-primary is-uppercase has-text-danger-dark has-background-white-bis has-text-weight-semibold has-text-centered"
		>
			show only pixels whose value is {selectedOperatorLabel ?? ''}
			{sliderBindValue[0] ?? ''}
		</div>
		<!-- </div> -->

		<div class="container pt-3">
			<div class="range-slider pt-5 pb-">
				<RangeSlider
					bind:values={sliderBindValue}
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

		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pt-5 pl-3 pr-3"
		>
			<button
				on:click={() => {
					cancel();
					setStep(1);
				}}
				class="button is-small primary-button has-text-weight-bold"
			>
				<i class="fa-solid fa-circle-xmark" /> &nbsp;Cancel
			</button>
			<button
				on:click={() => {
					initialRasterFilterStep[layer.id] = 1;
					clearState();
					setStep(1);
					applyExpression();
				}}
				disabled={conditionExpressionButtonDisabled}
				class="button is-small primary-button has-text-weight-bold"
			>
				<i class="fas fa-hammer" />&nbsp; Apply
			</button>
		</div>
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
