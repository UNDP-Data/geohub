<script module lang="ts">
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
	import { RasterTileData } from '$lib/RasterTileData';
	import { RasterComparisonOperators } from '$lib/config/AppConfig';
	import { getLayerStyle } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import { RASTERRESCALE_CONTEXT_KEY, type RasterRescaleStore } from '$stores';
	import {
		getActiveBandIndex,
		getLayerSourceUrl,
		getValueFromRasterTileUrl,
		initTooltipTippy,
		isInt,
		MAPSTORE_CONTEXT_KEY,
		Notification,
		Slider,
		updateParamsInURL,
		type BandMetadata,
		type MapStore,
		type RasterTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);

	const tippyTooltip = initTooltipTippy();

	interface Props {
		layer: Layer;
	}

	let { layer = $bindable() }: Props = $props();

	let info: RasterTileMetadata = layer.info as RasterTileMetadata;
	let initialStep: number | undefined = $state();
	let layerMin: number | undefined = $state();
	let layerMax: number | undefined = $state();
	let expression: RasterExpression | undefined = $state();

	onMount(() => {
		setLayerStats().then(() => {
			restoreExpression();
		});
	});

	const restoreExpression = () => {
		const expressionParam = getValueFromRasterTileUrl($map, layer.id, 'expression') as string;
		if (expressionParam) {
			// if expression is defined in source URL, restore expression
			const split = expressionParam.replace('where(', '').replace(');', '').split(',');
			const values = split[0].split(' ');
			const operator = values[1];
			const value = Number(values[2]);
			expression = {
				band: split[1]?.trim(),
				operator: operator,
				operatorLabel:
					RasterComparisonOperators.find((o) => o.value === operator)?.text ?? undefined,
				value: [value]
			};
			// go to the last step
			initialStep = 4;
		} else {
			// go to the first step
			resetExpression();
			initialStep = 1;
		}
	};

	const setLayerStats = async (params: Record<string, string> = undefined) => {
		if (params || !info.stats) {
			await updateStats(params);
		} else {
			//necessary to create Slider
			layerMin = info.stats[info.active_band_no].min;
			layerMax = info.stats[info.active_band_no].max;
		}
	};

	const updateStats = async (params: Record<string, string> = undefined) => {
		// if stats does not exist, try to fetch it
		const expression = params ? params['expression'] : undefined;
		const nodata = params ? params['nodata'] : undefined;
		if (!expression && !nodata) {
			// still no stats, use it from info
			const bandIndex = getActiveBandIndex(info); //normally info should be called as well
			const bandMetaStats = info['band_metadata'][bandIndex][1] as BandMetadata;
			layerMin = Number(bandMetaStats['STATISTICS_MINIMUM']);
			layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM']);
		} else {
			const rasterData = new RasterTileData(layer.dataset);
			const rasterInfo = await rasterData.getMetadata(undefined, expression, nodata);
			const bandName = Object.keys(rasterInfo.stats)[0];
			const stats = rasterInfo.stats[bandName];
			layerMin = Number(stats.min);
			layerMax = Number(stats.max);
		}
	};

	const removeExpression = async () => {
		const url: string = getLayerSourceUrl($map, layer.id) as string;
		const urlObj = new URL(url);
		urlObj.searchParams.delete('expression');
		urlObj.searchParams.delete('nodata');

		await setLayerStats({});
		updateParamsInURL(getLayerStyle($map, layer.id), urlObj, {}, $map);

		if (['<', '<='].includes(expression.operator)) {
			rescaleStore.set([$rescaleStore[0], layerMax]);
		} else if (['>', '>='].includes(expression.operator)) {
			rescaleStore.set([layerMin, $rescaleStore[1]]);
		} else {
			rescaleStore.set([layerMin, layerMax]);
		}
		resetExpression();
	};

	const applyExpression = async () => {
		let newParams = {};
		const expressionStringValue = `${[expression.band, expression.operator, expression.value[0]].join(' ')}`;
		let NO_DATA = info.nodata_value ?? -9999;
		if (!('nodata_value' in info)) {
			if (['<', '<='].includes(expression.operator)) {
				NO_DATA = expression.value[0] + 1;
			} else if (['>', '>='].includes(expression.operator)) {
				NO_DATA = expression.value[0] - 1;
			}
		}
		newParams['expression'] = `where(${expressionStringValue}, ${expression.band}, ${NO_DATA});`;
		newParams['nodata'] = NO_DATA;

		const url: string = getLayerSourceUrl($map, layer.id) as string;
		const lURL = new URL(url);

		await setLayerStats(newParams);
		updateParamsInURL(getLayerStyle($map, layer.id), lURL, newParams, $map);

		if (['<', '<='].includes(expression.operator)) {
			rescaleStore.set([$rescaleStore[0], expression.value[0]]);
		} else if (['>', '>='].includes(expression.operator)) {
			rescaleStore.set([expression.value[0], $rescaleStore[1]]);
		}
	};

	const resetExpression = () => {
		let avgValue = (layerMax + layerMin) * 0.5;
		if (isInt(layerMax) && isInt(layerMin)) {
			avgValue = parseInt(Number(avgValue).toFixed(0));
		} else {
			avgValue = parseFloat(Number(avgValue).toFixed(1));
		}

		expression = {
			band: info.active_band_no,
			operator: undefined,
			operatorLabel: undefined,
			value: [avgValue]
		};
	};

	const getSliderStep = () => {
		// this ensures the slider state is set to layer min max
		const range = layerMax - layerMin;
		const band = info.active_band_no;
		const median = Number(info.stats[band].median);
		const step =
			Number.isInteger(median) && Number.isInteger(layerMin) ? ~~(range * 1e-4) || 1 : range * 1e-4;
		return step;
	};
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css"
	/>
</svelte:head>

{#if initialStep}
	<Wizard bind:initialStep>
		<Step num={1}>
			{#snippet children({ nextStep })}
				<div
					class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center"
				>
					<div>
						<button
							onclick={nextStep}
							class="button is-primary is-small is-uppercase has-text-weight-bold"
						>
							ADD
						</button>
					</div>
				</div>
				<div class="mt-2">
					<Notification type="info" showCloseButton={false}>
						Create an <b>expression</b> and tranform the current layer's pixels values based on
						whether they <b>satisfy</b> or
						<b>not</b>
						a <b>condition</b>.
					</Notification>
				</div>
			{/snippet}
		</Step>
		<Step num={2}>
			{#snippet children({ nextStep, prevStep, setStep })}
				<div
					class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center"
				>
					<button
						onclick={prevStep}
						title="move back to start"
						class="button is-link is-small is-uppercase has-text-weight-bold"
					>
						<i class="fa fa-angles-left"></i> &nbsp;Back
					</button>

					<button
						onclick={() => {
							setStep(1);
							resetExpression();
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
					{#each RasterComparisonOperators as operator (operator.value)}
						{@const isVisible = !operator.disabled}
						{#if isVisible}
							<button
								class="button {operator.value === expression.operator ? 'is-success' : 'is-info'}"
								onclick={() => {
									expression = {
										...expression,
										operator: operator.value,
										operatorLabel: operator.text
									};
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
			{/snippet}
		</Step>
		<Step num={3}>
			{#snippet children({ nextStep, prevStep, setStep })}
				<div
					class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center"
				>
					<button
						onclick={prevStep}
						title="Operator categories"
						class="button is-link is-small is-uppercase has-text-weight-bold"
					>
						<i class="fa fa-angles-left"></i> &nbsp;Operator
					</button>

					<button
						onclick={() => {
							resetExpression();
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
					<Slider
						bind:values={expression.value as number[]}
						min={layerMin as number}
						max={layerMax as number}
						step={getSliderStep()}
						range={expression?.operator
							? ['>', '>='].includes(expression.operator)
								? 'max'
								: ['<', '<='].includes(expression.operator)
									? 'min'
									: false
							: false}
						first="label"
						last="label"
						rest={false}
						showEditor={true}
					/>
				</div>

				{#if $rescaleStore?.length === 2 && ($rescaleStore[0] !== layerMin || $rescaleStore[1] !== layerMax)}
					<div class="mt-2">
						<Notification type="warning" showCloseButton={false}>
							Rescale values ({$rescaleStore.join(', ')}) are removed when this transform is
							applied.
						</Notification>
					</div>
				{/if}

				<button
					onclick={() => {
						nextStep();
						applyExpression();
					}}
					disabled={expression?.operator && expression?.value ? false : true}
					class="button is-primary is-small is-uppercase has-text-weight-bold mt-2"
				>
					Apply
				</button>
			{/snippet}
		</Step>
		<Step num={4}>
			{#snippet children({ setStep })}
				<div
					class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center"
				>
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
						onclick={() => {
							removeExpression();
							setStep(1);
						}}
						class="button is-primary is-small is-uppercase has-text-weight-bold ml-auto"
					>
						Clear filter
					</button>
				</div>
			{/snippet}
		</Step>
	</Wizard>
{/if}

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 5px;
	}
</style>
