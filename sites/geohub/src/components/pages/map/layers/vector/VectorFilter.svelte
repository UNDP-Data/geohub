<script context="module" lang="ts">
	export const FILTER_INPUTTAGS_CONTEXT_KEY = 'vector-filter-input-tags';
	export type FilterInputTags = Writable<unknown[]>;
	const createFilterInputTagsStore = () => {
		return writable([]);
	};
</script>

<script lang="ts">
	import OperationButtons from '$components/pages/map/layers/vector/OperationButtons.svelte';
	import PropertySelectButtons from '$components/pages/map/layers/vector/PropertySelectButtons.svelte';
	import ValueInput from '$components/pages/map/layers/vector/ValueInput.svelte';
	import Step from '$components/util/Step.svelte';
	import Wizard from '$components/util/Wizard.svelte';
	import { VectorFilterOperators } from '$lib/config/AppConfig';
	import { clean, getLayerStyle } from '$lib/helper';
	import type { Layer, VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { toast } from '@zerodevx/svelte-toast';
	import { getContext, onMount, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const filterInputTags = createFilterInputTagsStore();
	setContext(FILTER_INPUTTAGS_CONTEXT_KEY, filterInputTags);

	export let layer: Layer;

	const layerId = layer.id;

	// vars
	let currentExpressionIndex = 0;
	// let exprText
	let singleExpression = {
		index: 0,
		property: '',
		value: '',
		operator: ''
	};
	// eslint-disable-next-line @typescript-eslint/ban-types
	let expressionsArray: { property: string; index: number; value: string; operator: string }[] = [
		singleExpression
	];

	let selectedCombiningOperator = 'all';
	//let propertySelectValue = expressionsArray[currentExpressionIndex]['property']
	let propertySelectValue: string;
	let initialStep = 1;
	let stringProperty = false;
	let numberProperty = false;
	let acceptSingleTag = true;
	let expressionApplied = false;
	let customTagsAvailable = false;

	const tippy = initTooltipTippy({
		placement: 'bottom',
		theme: 'light',
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		trigger: 'mouseenter focus click'
	});
	let tooltipContent: HTMLElement;

	onMount(() => {
		// restore filter expression from layer style
		const layerStyle = getLayerStyle($map, layer.id);
		const filter = layerStyle.filter;
		if (filter) {
			expressionsArray = [];
			if (filter[0] === 'all') {
				for (let i = 1; i < filter.length; i++) {
					const expr = filter[i];
					expressionsArray = [
						...expressionsArray,
						{
							index: expressionsArray.length - 1,
							operator: expr[0],
							property: expr[1][1],
							value: expr[2]
						}
					];
				}
			} else {
				expressionsArray = [
					{
						index: 0,
						operator: filter[0],
						property: filter[1][1],
						value: filter[2]
					}
				];
			}

			currentExpressionIndex = expressionsArray.length - 1;
		}
	});

	const handlePropertySelect = (e) => {
		if (e.detail.prop) {
			propertySelectValue = e.detail.prop;
			const layerStyle = getLayerStyle($map, layer.id);
			const metadata = layer.info as VectorTileMetadata;
			const tilestatLayer = metadata.json.tilestats.layers.find(
				(l) => l.layer === layerStyle['source-layer']
			);
			const propertyProps = tilestatLayer.attributes.find(
				(e) => e['attribute'] === propertySelectValue
			);
			const dataType = propertyProps['type'];
			if (dataType) {
				stringProperty = dataType === 'string';
				numberProperty =
					dataType === 'number' || dataType.includes('int') || dataType.includes('float'); // last two not really necessary (ioan)
			}
			expressionsArray[currentExpressionIndex]['property'] = propertySelectValue;
		}
	};

	const generateExpressionFromExpressionsArray = (expressionsArray) => {
		let expressions = [];
		return expressionsArray.map((expression) => {
			if (expression['property'] === undefined) return;
			if (expression['operator'] === undefined) return;
			if (expression['value'] === undefined) return;
			if (customTagsAvailable) {
				if (expression['value'].length > 1) {
					if (expression['operator'] === 'in') {
						combineOperator = false;
						expressions = expression['value'].map((val) => [
							'in',
							val,
							['get', expression['property']]
						]);
						return ['any', ...expressions];
					}
					if (expression['operator'] === '!in') {
						combineOperator = true;
						expressions = expression['value'].map((val) => [
							'!',
							['in', val, ['get', expression['property']]]
						]);
						return ['all', ...expressions];
					}
				}
				if (expression['value'].length === 1) {
					if (expression['operator'] === 'in') {
						return ['in', expression['value'][0], ['get', expression['property']]];
					}
					if (expression['operator'] === '!in') {
						return ['!', ['in', expression['value'][0], ['get', expression['property']]]];
					}
				}
			} else {
				if (expression['operator'] === 'in') {
					return [
						expression['operator'],
						['get', expression['property']],
						['literal', expression['value']]
					];
				} else if (expression['operator'] === '!in') {
					return ['!', ['in', ['get', expression['property']], ['literal', expression['value']]]];
				} else {
					return [
						expression['operator'],
						['get', expression['property']],
						isNaN(Number(expression['value']))
							? expression['value'][0]
							: Number(expression['value'])
					];
				}
			}
		});
	};

	const generateFilterExpression = (expressionsArray) => {
		const expression = generateExpressionFromExpressionsArray(expressionsArray);
		if (expression.length === 0) return;
		if (expression.length === 1) return expression[0];
		if (customTagsAvailable) return expression;
		return [selectedCombiningOperator, ...expression];
	};

	// Apply expression to layer
	const handleApplyExpression = () => {
		//console.log(JSON.stringify(expressionsArray, null, '\t'))

		const expression = generateFilterExpression(expressionsArray);
		// console.log(JSON.stringify(expression, null, '\t'))
		if (expression === undefined) {
			return;
		}

		$map.setFilter(layerId, expression);

		// if layer has labels, set filter on labels
		$map.getStyle().layers.filter((layer) => layer.id === `${layerId}-label`).length > 0
			? $map.setFilter(`${layerId}-label`, expression)
			: null;
		expressionApplied = true;
		$map.once('error', (err: ErrorEvent) => {
			toast.push(
				err.error?.message ??
					'The map filter was not applied. Please check the that all filters are valid.'
			);
		});
		if ($filterInputTags.length > 0) {
			$filterInputTags = [];
		}
	};

	// Clear all expressions applied to the layer and reset the UI
	const handleClearExpression = () => {
		expressionApplied = false;
		$map.setFilter(layerId, null);
		currentExpressionIndex = 0;
		expressionsArray = [
			{
				index: 0,
				property: '',
				value: '',
				operator: ''
			}
		];
		// expressionsArray.splice(currentExpressionIndex, 1, {})

		// Check if the filtered layer has a label layer and if true, remove the filter from the label layer
		$map.getStyle().layers.filter((layer) => layer.id === `${layerId}-label`).length > 0
			? $map.setFilter(`${layerId}-label`, null)
			: null;
	};

	const handleCancelExpression = () => {
		expressionsArray = expressionsArray.filter((e) => e.index < currentExpressionIndex);
		currentExpressionIndex -= 1;
		if (expressionsArray.length == 0) {
			expressionsArray = [
				{
					index: 0,
					property: '',
					value: '',
					operator: ''
				}
			];
			currentExpressionIndex = 0;
		}
		if ($filterInputTags.length > 0) {
			$filterInputTags = [];
		}

		clearClickLayer();
	};

	const clearClickLayer = () => {
		if (layer.children?.length > 0) {
			const child = layer.children.find((l) => l.id === `${layerId}-select`);
			if (child) {
				if ($map.getLayer(child.id)) {
					$map.removeLayer(child.id);
				}
				layer.children.splice(layer.children.indexOf(child), 1);
			}
		}
	};

	const handleCurrentOperation = (e) => {
		expressionsArray[currentExpressionIndex]['operator'] = e.detail.operation;
	};

	const handleAddExpression = () => {
		currentExpressionIndex = currentExpressionIndex + 1;
		expressionsArray = [
			...expressionsArray,
			{ index: currentExpressionIndex, property: '', operator: '', value: '' }
		];
	};

	const handleDisableTags = () => {
		acceptSingleTag = true;
	};

	const handleEnableTags = () => {
		acceptSingleTag = false;
	};

	let combineOperator = true;

	$: {
		if (combineOperator) {
			selectedCombiningOperator = 'all';
		} else {
			selectedCombiningOperator = 'any';
		}
	}

	const handleCustomTags = (e) => {
		customTagsAvailable = true;
		expressionsArray[currentExpressionIndex]['value'] = e.detail;
	};

	// $: {
	//   console.log(expressionsArray)
	//   //console.log(currentExpressionIndex)
	// }
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css"
	/>
</svelte:head>
<div class="field" style="margin: auto; display: flex; justify-content: space-between">
	<span class="condition-text">One condition must be true</span>
	<input
		bind:checked={combineOperator}
		id="switchExample"
		type="checkbox"
		name="switchExample"
		class="switch"
	/>
	<label class="condition-text" for="switchExample">All conditions must be true</label>
</div>

<div style="margin:10px" class="is-divider" />
<Wizard {initialStep}>
	<Step num={1} let:nextStep>
		<div class="wizard-button-container">
			<button
				on:click={() => {
					if (expressionsArray[0].value) {
						handleAddExpression();
					}
					nextStep();
				}}
				class="button is-small is-primary has-text-weight-bold is-uppercase"
			>
				{expressionsArray[0].value ? 'Add' : 'New rule'}
			</button>
			{#if expressionApplied || expressionsArray[0].value !== ''}
				<!-- <div class="dropdown is-hoverable"> -->
				<!-- <div class="dropdown-trigger"> -->
				<button
					class="button is-small is-primary has-text-weight-bold is-uppercase"
					aria-haspopup="true"
					aria-controls="dropdown-menu1"
					use:tippy={{ content: tooltipContent }}
				>
					<span>View</span>
					<span class="icon is-small">
						<i class="fas fa-angle-down" aria-hidden="true" />
					</span>
				</button>
				<!-- </div> -->
				<!-- <div class="dropdown-menu" bind:this={tooltipContent}> -->
				<div class="dropdown-content" bind:this={tooltipContent}>
					<!-- <hr class="dropdown-divider"> -->

					{#each expressionsArray as expr, i}
						{@const op = VectorFilterOperators.filter((i) => i.value == expr.operator)}

						{#if op && op.length > 0}
							<div class="menu-item">
								<div class="tags has-addons is-centered">
									<div class="tag is-info is-dark is-small">{clean(expr.property)}</div>
									<div class="tag is-danger is-dark is-small">{op[0].text}</div>
									<div class="tag is-success is-dark is-small">{expr.value}</div>
								</div>
							</div>
							{#if i < expressionsArray.length - 1}
								<div
									class="is-divider is-danger m-4"
									data-content={selectedCombiningOperator == 'all' ? 'AND' : 'OR'}
								/>
							{/if}
						{/if}
					{/each}
				</div>
				<!-- </div> -->
				<!-- </div> -->

				<button
					on:click={handleClearExpression}
					class="button is-small is-primary has-text-weight-bold is-uppercase"
				>
					Clear filter{expressionsArray.length > 1 ? '(s)' : ''}
				</button>
			{/if}
		</div>
	</Step>
	<Step num={2} let:nextStep let:setStep>
		<div class="wizard-button-container">
			<!-- {#if expressionApplied || expressionsArray[0].value !== ''}
          <button on:click={handleClearExpression} class="button wizard-button is-small primary-button">
            Clear filter{expressionsArray.length > 1 ? 's' : ''}
          </button>
        {/if} -->
			<button
				on:click={() => {
					handleCancelExpression();
					setStep(1);
				}}
				class="button is-small is-primary has-text-weight-bold is-uppercase"
			>
				Cancel
			</button>
			<!-- <button
          disabled={expressionsArray[currentExpressionIndex].property === ''}
          on:click={nextStep}
          class="button wizard-button is-small primary-button"
          title="">
          Select an operator &nbsp;
          <i class="fa fa-chevron-right" />
        </button> -->
		</div>
		<div class="is-divider separator is-danger" data-content="Select a property..." />
		<PropertySelectButtons
			{layer}
			bind:propertySelectValue={expressionsArray[currentExpressionIndex].property}
			on:select={(e) => {
				handlePropertySelect(e);
			}}
			on:click={nextStep}
		/>
	</Step>
	<Step num={3} let:prevStep let:nextStep let:setStep>
		<!--      Pick one operation from the selected-->
		<div class="wizard-button-container">
			<button
				title="move back to properties"
				on:click={prevStep}
				class="button is-small is-link has-text-weight-bold is-uppercase"
			>
				<i class="fa fa-angles-left" />&nbsp;Properties
			</button>
			<button
				on:click={() => {
					handleCancelExpression();
					setStep(1);
				}}
				class="button is-small is-primary has-text-weight-bold is-uppercase"
			>
				Cancel
			</button>
			<!-- <button
          disabled={expressionsArray[currentExpressionIndex].operator === ''}
          on:click={nextStep}
          class="button wizard-button is-small primary-button">
          Pick a value &nbsp;
          <i class="fa fa-chevron-right" />
        </button> -->
		</div>
		<div class="is-divider separator is-danger" data-content="Select an operator..." />
		<OperationButtons
			on:enableTags={handleEnableTags}
			on:disableTags={handleDisableTags}
			bind:numberProperty
			bind:stringProperty
			bind:currentSelectedOperation={expressionsArray[currentExpressionIndex].operator}
			on:change={handleCurrentOperation}
			on:click={nextStep}
		/>
	</Step>
	<Step num={4} let:prevStep let:setStep>
		<!--      Pick one operation from the selected-->
		<div class="wizard-button-container">
			<button
				on:click={prevStep}
				title="move back to operators"
				class="button is-small is-link has-text-weight-bold is-uppercase"
			>
				<i class="fa fa-angles-left" /> &nbsp;Operators
			</button>
			<button
				on:click={() => {
					handleCancelExpression();
					setStep(1);
				}}
				class="button is-small is-primary has-text-weight-bold is-uppercase"
			>
				Cancel
			</button>
		</div>

		<div class="is-divider separator is-danger" data-content="Select/input a value..." />
		<ValueInput
			on:apply={() => {
				handleApplyExpression();
				setStep(1);
			}}
			on:customTags={handleCustomTags}
			bind:layer
			bind:acceptSingleTag
			bind:propertySelectedValue={expressionsArray[currentExpressionIndex]['property']}
			bind:expressionValue={expressionsArray[currentExpressionIndex]['value']}
			bind:operator={expressionsArray[currentExpressionIndex]['operator']}
		/>
	</Step>
	<!-- this is commented because it is not used anymore
    <Step num={5} let:prevStep let:setStep>
      
      <div class="wizard-button-container">
        <button on:click={prevStep} class="button wizard-button is-small secondary-button">
          <i class="fa fa-chevron-left" />
          &nbsp; Pick a value
        </button>
        <button
          on:click={() => {
            handleAddExpression()
            setStep(2)
          }}
          class="button wizard-button is-small primary-button">
          <i class="fa fa-plus" />
          &nbsp; New filter
        </button>
        <button
          on:click={() => {
            handleApplyExpression()
            setStep(1)
          }}
          class="button wizard-button is-small primary-button">
          <i class="fa fa-hammer" />
          &nbsp; Apply filter{expressionsArray.length > 1 ? 's' : ''}
        </button>
      </div>
    </Step>
  -->
</Wizard>

<style lang="scss">
	@import 'bulma-slider/dist/css/bulma-slider.min.css';

	:global(.other-button) {
		background: #b5d5f5 !important;
		border-color: #b5d5f5 !important;
		border-radius: 0px !important;
		color: white !important;
	}

	.button {
		font-weight: bolder;
	}
	.wizard-button-container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		margin: 10px;
	}

	.condition-text {
		margin: 0px 5px;
		text-align: center;
	}

	:global(.style-editing-box) {
		margin: auto !important;
	}
</style>
