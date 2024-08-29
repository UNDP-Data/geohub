<script context="module" lang="ts">
	/* state variables used to keep the state of the wizard*/
	const originalRasterFilterUrl = {};
	let selectedRasterFilterOperatorCategory = 'comparison';
	let selectedRasterFilterOperator: string = undefined;
	let selectedRasterFilterInputCategory = 'layer';
	let initialRasterFilterStep = 1;
</script>

<script lang="ts">
	/*
A component designed to apply where expression to a raster layer through titiler

*/
	import RasterTransformNumbersInput from '$components/pages/map/layers/raster/RasterTransformNumbersInput.svelte';
	import Step from '$components/util/Step.svelte';
	import Wizard from '$components/util/Wizard.svelte';
	import { RasterArithmeticOperators, RasterComparisonOperators } from '$lib/config/AppConfig';
	import { fetchUrl, getActiveBandIndex, getLayerSourceUrl } from '$lib/helper';
	import type { BandMetadata, Layer, RasterLayerStats, RasterTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Slider, handleEnterKey } from '@undp-data/svelte-undp-components';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	//expression parts
	const whereExpressionParts = [
		{ name: 'condition', label: 'condition', icon: 'fa-solid fa-question', color: 'has-text-info' },
		{
			name: 'truthy',
			label: 'true value',
			icon: 'fa-solid fa-thumbs-up',
			color: 'has-text-success'
		},
		{
			name: 'falsy',
			label: 'false value',
			icon: 'fa-solid fa-thumbs-down',
			color: 'has-text-danger-dark'
		}
	];

	let currentExpressionPart: 'condition' | 'truthy' | 'falsy' = 'condition';
	//operator categories
	const operatorCategories = [
		{ name: 'comparison', op: RasterComparisonOperators },
		{ name: 'arithmetic', op: RasterArithmeticOperators }
	];
	const rasterComparisonOperatorsValues = RasterComparisonOperators.map((e) => e.value);
	let selectedOperatorCategory: string = selectedRasterFilterOperatorCategory || undefined;

	//operators
	let selectedOperator: string = selectedRasterFilterOperator || undefined;
	let selectedOperatorObject = RasterComparisonOperators;

	//input categories (numbers and slider binded to the layer Min<=>Max)
	const inputCategories = ['layer', 'numbers'];
	//const numberInput:Array<string> = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '(', ')']
	let selectedInputCategory = selectedRasterFilterInputCategory || undefined;

	/*
    Expression object consisting of a band property and expressions property. The expressions is an object where the key or property name
    and the values is as number set by the user either using  the numbers interface or the range slider binded to the layer min max
  */
	const emptyExpression = { band: undefined, expressions: {} };
	/**
   where expression object, consisting of three properties as arrays or expression objects. The three properties
   correspond to the three parts of a titiler where expression 
  */
	const emptyWhereExpression = {
		condition: [{ ...emptyExpression }],
		truthy: [{ ...emptyExpression }],
		falsy: [{ ...emptyExpression }]
	};
	let whereExpression = { ...emptyWhereExpression };
	//int index accessor or the exression objects in the expression part array
	$: expressionIndex = whereExpression[currentExpressionPart].length - 1;

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

	// const clearExpression = () => {
	//   console.log(`clearing expression`)
	//   updateParamsInURL(getLayerStyle($map, layer.id), originalRasterFilterUrl[layer.id], {})
	// }

	// const applyExpression = async (e: MouseEvent) => {
	//   let newParams = {}
	//   console.log(JSON.stringify(expression))

	//   newParams['expression'] = ``

	//   const exprStatUrl = new URL(
	//     `${lURL.protocol}//${lURL.host}/cog/statistics?url=${url}}&expression=${encodeURIComponent(
	//       newParams['expression'],
	//     )}`,
	//   )

	//   const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())

	//   //updateParamsInURL(getLayerStyle($map, layer.id), lURL, newParams)
	// }

	const clear = () => {
		selectedOperator = undefined;
		selectedOperatorObject = RasterComparisonOperators;
		selectedOperatorCategory = 'comparison';
		selectedInputCategory = 'layer';
	};

	const cancel = () => {
		clear();
		expressionIndex = 0;
		//expressionIndex = 0
		whereExpression = {
			condition: [{ ...emptyExpression }],
			truthy: [{ ...emptyExpression }],
			falsy: [{ ...emptyExpression }]
		};
	};

	const onSliderStop = (event: CustomEvent) => {
		setWhereExpression(currentExpressionPart, 'expressions', {
			[selectedOperator]: event.detail.values
		});
	};

	const onNumbersClick = (event: CustomEvent) => {
		setWhereExpression(currentExpressionPart, 'expressions', {
			[selectedOperator]: event.detail.value
		});
	};

	/*sets the where expression parts/properties/values in one shot*/

	const setWhereExpression = (
		part: 'condition' | 'truthy' | 'falsy',
		property: 'band' | 'expressions',
		value: string | Record<string, unknown> = undefined
	) => {
		// console.clear()
		// console.log(
		//   `new: ${JSON.stringify(value, uf, '')} old: ${JSON.stringify(
		//     whereExpression[part][expressionIndex][property],
		//     uf,
		//     '',
		//   )}`,
		// )

		if (value === Object(value)) {
			//console.log(`MERGE ${property} ${JSON.stringify(value)}`)
			whereExpression[part][expressionIndex][property] = {
				...whereExpression[part][expressionIndex][property],
				...(value as Record<string, unknown>)
			};
		} else {
			//console.log(`ASSIGN ${property} ${JSON.stringify(value)}`)
			whereExpression[part][expressionIndex][property] = value;
		}
	};

	let continueExpressionButtonDisabled = true;
	let conditionExpressionButtonDisabled = true;
	// const uf = (k, v) => {
	//   return v === undefined ? null : v
	// }
	$: {
		//console.clear()

		//console.log(`${JSON.stringify(whereExpression[currentExpressionPart], uf, '\t')} expressionIndex: ${expressionIndex}`)
		//console.log(`${JSON.stringify(whereExpression[currentExpressionPart], uf, '\t')} `)

		if (
			Object.keys(whereExpression[currentExpressionPart][expressionIndex].expressions).length > 0
		) {
			const [lastKey, lastValue] = Object.entries(
				whereExpression[currentExpressionPart][expressionIndex].expressions
			).at(-1);
			continueExpressionButtonDisabled =
				lastKey && lastValue !== undefined && !rasterComparisonOperatorsValues.includes(lastKey)
					? false
					: true;
			conditionExpressionButtonDisabled =
				lastKey && lastValue != undefined && rasterComparisonOperatorsValues.includes(lastKey)
					? false
					: true;

			//console.log(`lastkey: ${lastKey} lastValue: ${lastValue} \n continueExpressionButtonDisabled : ${continueExpressionButtonDisabled} \n conditionExpressionButtonDisabled ${conditionExpressionButtonDisabled}`)
		}
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css"
	/>
</svelte:head>

<!-- <div class="tile is-ancestor is-centered m-0 has-tooltip-info">
    <div class="tile is-parent">
        <div class="tile is-child notification is-white has-text-centered subtitle p-0 " >
           
            <div class="field">
                <input
                id="switchCombine"
                type="checkbox"
                name="switchCombine"
                class="switch is-rounded "
                
                bind:checked={combineOperator} />
                <label
                for="switchCombine"
                class="is-size-6">All conditions must be true</label>
            </div>
        </div>
    </div>
    
</div>

<div class="is-divider m-1 p-1" /> -->

<!-- {#if initialFilterStep>1}
  <div class="notification is-danger is-light has-text-centered is-size-4 pt-3">
    
    {#if whereExpression.condition.length>0}
      where pixels are
      {#each whereExpression.condition as expr, i}

        {#if expr?.operator}
          
          {@const op = rasterComparisonOperators.find(el=>el.value === expr.operator)}
          {op.text}
          {#if expr?.value}
            {expr.value}
          {/if}
          {#if i < whereExpression.condition.length - 1}
            <div
              class="is-divider is-danger "
              data-content={combineOperator == false ? 'AND' : 'OR'} />
          {/if}
        {/if}
      {/each}
    {/if}
  </div>
{/if} -->
<!-- eslint-disable svelte/no-object-in-text-mustaches -->
{[currentExpressionPart, expressionIndex]}
{`${JSON.stringify(whereExpression[currentExpressionPart], null, '\t')} `}

<Wizard initialStep={initialRasterFilterStep}>
	<Step num={1} let:nextStep>
		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pb-3"
		>
			<button
				on:click={() => {
					nextStep();
					initialRasterFilterStep = 2;
					setWhereExpression(currentExpressionPart, 'band', band);
					//whereExpression.condition = [...whereExpression.condition, { band: `${band}` }] //direct set used with
				}}
				class="button is-primary is-small is-uppercase has-text-weight-bold"
			>
				{whereExpression.condition.length > 0 ? 'Add' : 'New rule'}
			</button>
		</div>
		<div class="notification is-danger is-light has-text-centered p-1">
			Create an <b>expression</b> and tranform the current layer's pixels values based on whether
			they <b>satisfy</b> or
			<b>not</b>
			a <b>condition</b>.
		</div>
		<div class="is-divider separator is-danger p-0" data-content="The general form is..." />

		<figure class="image">
			<img alt="" width="300" src="/conditional-operator.jpg" />
		</figure>
		<div class="is-divider separator is-danger p-0" data-content="A concrete example ..." />
		<figure class="image p-2">
			<img alt="" width="300" src="/map_algebra_unilayer.png" />
		</figure>
	</Step>

	<Step num={2} let:nextStep let:setStep let:prevStep>
		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pb-3"
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

		<div class="card">
			<div
				class="card-content p-5 m-0 is-size-6 is-family-primary is-uppercase has-background-white has-text-weight-semibold has-text-centered"
			>
				<!-- {currentExpressionPart} -->
				{#each whereExpressionParts as { name, label, icon, color }}
					<span
						class="tag p-1 is-size-6 {name === currentExpressionPart
							? 'is-danger is-dark'
							: 'has-text-grey-light'}">{label}</span
					>
					<span class="icon {color}"><i class={icon} /> </span>
				{/each}
			</div>
			<footer class="card-footer">
				{#each operatorCategories as { name, op }}
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<span
						role="navigation"
						class="card-footer-item is-subtitle is-capitalized has-text-weight-bold is-clickable {name ==
						selectedOperatorCategory
							? 'has-background-success has-text-white-bis'
							: ''}"
						on:keydown={handleEnterKey}
						on:click={() => {
							selectedOperatorCategory = name;
							selectedRasterFilterOperatorCategory = selectedOperatorCategory;
							selectedOperatorObject = op;
						}}
					>
						{name}
					</span>
				{/each}
			</footer>
		</div>
		{#if selectedOperatorObject !== undefined}
			<div class="grid pt-5">
				{#each selectedOperatorObject as operator}
					{@const isVisible = !operator.disabled}
					{#if isVisible}
						<div
							class="card is-info is-clickable has-text-centered"
							role="button"
							tabindex="0"
							on:keydown={handleEnterKey}
							on:click={() => {
								selectedOperator = operator.value;
								//  not necessary
								// setWhereExpression(
								//   currentExpressionPart,
								//   'expressions',
								//   { [selectedOperator]: undefined },
								//   mergeExpressions,
								// )
								selectedInputCategory = rasterComparisonOperatorsValues.includes(selectedOperator)
									? 'layer'
									: 'numbers';

								initialRasterFilterStep = 3;
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
		{/if}
	</Step>

	<Step num={3} let:nextStep let:setStep let:prevStep>
		<div
			class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pb-3"
		>
			<button
				on:click={() => {
					prevStep();
					initialRasterFilterStep = 2;
				}}
				title="Operator categories"
				class="button is-link is-small is-uppercase has-text-weight-bold"
			>
				<i class="fa fa-angles-left" /> &nbsp;Change operator
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

		<div class="card">
			<!-- <div
        class="card-content p-2 m-0 is-size-5 is-family-primary is-uppercase has-text-weight-semibold has-text-danger-dark has-background-white-bis has-text-centered ">
        {currentExpressionPart}
      </div> -->
			<div
				class="card-content p-5 m-0 is-size-6 is-family-primary is-uppercase has-background-white has-text-weight-semibold has-text-centered"
			>
				<!-- {currentExpressionPart} -->
				{#each whereExpressionParts as { name, label, icon, color }}
					<span
						class="tag p-1 is-size-6 {name === currentExpressionPart
							? 'is-danger is-dark'
							: 'has-text-grey-light'}">{label}</span
					>
					<span class="icon {color}"><i class={icon} /> </span>
				{/each}
			</div>
			<footer class="card-footer">
				{#each inputCategories as inputCategory}
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<span
						role="navigation"
						class="card-footer-item is-subtitle is-capitalized has-text-weight-bold is-clickable {inputCategory ==
						selectedInputCategory
							? 'has-background-success has-text-white-bis'
							: ''}"
						on:keydown={handleEnterKey}
						on:click={() => {
							selectedInputCategory = inputCategory;
							selectedRasterFilterInputCategory = selectedInputCategory;
						}}
					>
						{inputCategory}
					</span>
				{/each}
			</footer>
		</div>

		<div class="container">
			{#if selectedInputCategory == 'layer'}
				<div class="pt-5 pb-">
					<Slider
						bind:values={sliderBindValue}
						min={layerMin}
						max={layerMax}
						{step}
						range="min"
						first="label"
						last="label"
						rest={false}
						on:change={onSliderStop}
					/>
				</div>
			{:else if selectedInputCategory === 'numbers'}
				<RasterTransformNumbersInput on:click={onNumbersClick} />
			{/if}
		</div>

		<div class="buttons my-2">
			<button
				on:click={() => {
					initialRasterFilterStep = 2; //go back
					clear();
					whereExpression.condition = [
						...whereExpression.condition,
						{ band: `${band}`, expressions: {} }
					];
					setStep(2);
				}}
				disabled={conditionExpressionButtonDisabled}
				class="button is-link is-small is-uppercase has-text-weight-bold"
			>
				Add
			</button>

			<button
				on:click={() => {
					initialRasterFilterStep = 4;
					clear();
					nextStep();
				}}
				disabled={conditionExpressionButtonDisabled}
				class="button is-link is-small is-uppercase has-text-weight-bold ml-auto"
			>
				<i class="fas fa-angles-right" />&nbsp; True
			</button>
		</div>
		{#if !rasterComparisonOperatorsValues.includes(whereExpression[currentExpressionPart][expressionIndex]['expressions'])}
			<button
				on:click={() => {
					initialRasterFilterStep = 2; //set state to step 2
					clear();
					setStep(2);
				}}
				disabled={continueExpressionButtonDisabled}
				class="button is-link is-small is-uppercase has-text-weight-bold is-fullwidth"
			>
				<i class="fas fa-rotate" />&nbsp;Continue with current
			</button>
		{/if}
	</Step>
</Wizard>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 5px;
	}
</style>
