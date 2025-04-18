<script module lang="ts">
	export const FILTER_INPUTTAGS_CONTEXT_KEY = 'vector-filter-input-tags';
	export type FilterInputTags = Writable<string[]>;
	const createFilterInputTagsStore = () => {
		return writable([]);
	};

	interface FilterExpression {
		property: string;
		index: number;
		value: string | number | (string | number)[];
		operator: string;
	}

	const restoreExpression = (expression: Expression): FilterExpression[] => {
		// Handle logical expressions (AND/OR)
		if (expression[0] === 'all' || expression[0] === 'any') {
			return expression.slice(1).flatMap((expr) => restoreExpression(expr as Expression));
		}

		// Handle IN condition
		if (expression[0] === 'in') {
			const property = expression[1][1];
			let value: (string | number)[] | string | number;
			if (Array.isArray(expression[2]) && expression[2][0] === 'literal') {
				value = expression[2][1] as (string | number)[] | string | number;
			} else {
				throw new Error('Invalid IN expression format');
			}

			return [
				{
					index: 0,
					operator: 'in',
					property: property,
					value: Array.isArray(value) ? value : [value]
				}
			];
		}

		// Handle NOT IN condition
		if (expression[0] === '!') {
			const inExpression = expression[1] as InExpression;
			const property = inExpression[1][1];
			const value = inExpression[2][1];

			return [
				{
					index: 0,
					operator: '!in',
					property: property,
					value: Array.isArray(value) ? value : [value]
				}
			];
		}

		// Handle single condition
		const operator = expression[0];
		const property = expression[1][1];
		const value = expression[2];
		const values = Array.isArray(value) ? (value as (string | number)[]) : [value];
		return [
			{
				index: 0,
				operator: operator,
				property: property as string,
				value: values
			}
		];
	};
</script>

<script lang="ts">
	import OperationButtons from '$components/pages/map/layers/vector/OperationButtons.svelte';
	import ValueInput from '$components/pages/map/layers/vector/ValueInput.svelte';
	import Step from '$components/util/Step.svelte';
	import Wizard from '$components/util/Wizard.svelte';
	import { VectorFilterOperators } from '$lib/config/AppConfig';
	import { getLayerStyle, type Expression, type InExpression } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import {
		clean,
		initTooltipTippy,
		MAPSTORE_CONTEXT_KEY,
		PropertySelect,
		type MapStore,
		type VectorTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { Switch } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import { getContext, onMount, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const filterInputTags = createFilterInputTagsStore();
	setContext(FILTER_INPUTTAGS_CONTEXT_KEY, filterInputTags);

	interface Props {
		layer: Layer;
	}

	let { layer = $bindable() }: Props = $props();

	const layerId = layer.id;
	const metadata = layer.info as VectorTileMetadata;

	// vars
	let currentExpressionIndex = $state(0);
	// let exprText
	let singleExpression = {
		index: 0,
		property: '',
		value: '',
		operator: ''
	};

	let expressionsArray: FilterExpression[] = $state([singleExpression]);

	let selectedCombiningOperator: 'all' | 'any' = $state('all');
	let propertySelectValue: string;
	let initialStep = 1;
	let stringProperty = $state(false);
	let numberProperty = $state(false);
	let acceptSingleTag = $state(true);
	let expressionApplied = $state(false);
	let customTagsAvailable = false;

	const tippy = initTooltipTippy({
		placement: 'bottom',
		theme: 'light',
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		trigger: 'mouseenter focus click'
	});
	let tooltipContent: HTMLElement | undefined = $state();

	onMount(() => {
		// restore filter expression from layer style
		const layerStyle = getLayerStyle($map, layer.id);
		const filter = layerStyle.filter;
		if (filter) {
			const expr = filter as unknown as Expression;
			const array = restoreExpression(expr);
			for (let i = 0; i < array.length; i++) {
				array[i].index = i;
			}
			expressionsArray = [...array];
			if (expr[0] === 'all' || expr[0] === 'any') {
				selectedCombiningOperator = expr[0];
				combineOperator = selectedCombiningOperator === 'all';
			}
			currentExpressionIndex = expressionsArray.length - 1;
		}
	});

	const handlePropertySelect = (value: string, nextStep: () => void) => {
		propertySelectValue = value;
		if (propertySelectValue) {
			const layerStyle = getLayerStyle($map, layer.id);
			const metadata = layer.info as VectorTileMetadata;
			const tilestatLayer = metadata.json?.tilestats?.layers.find(
				(l) => l.layer === layerStyle['source-layer']
			);
			const propertyProps = tilestatLayer?.attributes.find(
				(e) => e['attribute'] === propertySelectValue
			);
			if (propertyProps) {
				const dataType = propertyProps['type'];
				if (dataType) {
					stringProperty = ['string', 'mixed'].includes(dataType);
					numberProperty =
						dataType === 'number' || dataType.includes('int') || dataType.includes('float'); // last two not really necessary (ioan)
				}
			}

			expressionsArray[currentExpressionIndex]['property'] = propertySelectValue;
			nextStep();
		}
	};

	const generateExpressionFromExpressionsArray = (expressionsArray: FilterExpression[]) => {
		let expressions = [];
		const filteredArray = expressionsArray.filter((expr) => {
			return expr['property'] && expr['operator'] && expr['value'];
		});
		return filteredArray.map((expression) => {
			if (expression['property'] === undefined) return;
			if (expression['operator'] === undefined) return;
			if (expression['value'] === undefined) return;
			if (customTagsAvailable) {
				if (Array.isArray(expression['value']) && expression['value'].length > 1) {
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
				if (Array.isArray(expression['value']) && expression['value'].length === 1) {
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
							? Array.isArray(expression['value']) && expression['value'][0]
							: Number(expression['value'])
					];
				}
			}
		});
	};

	const generateFilterExpression = (expressionsArray: FilterExpression[]) => {
		const expression = generateExpressionFromExpressionsArray(expressionsArray);
		if (expression.length === 0) return;
		if (expression.length === 1) return expression[0];
		if (customTagsAvailable) return expression;
		return [selectedCombiningOperator, ...expression];
	};

	// Apply expression to layer
	const handleApplyExpression = () => {
		const expression = generateFilterExpression(expressionsArray);
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

	const handleCurrentOperation = (operation: string) => {
		expressionsArray[currentExpressionIndex]['operator'] = operation;
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

	let combineOperator = $state(true);

	const handleCombineOperatorChanged = () => {
		if (combineOperator) {
			selectedCombiningOperator = 'all';
		} else {
			selectedCombiningOperator = 'any';
		}
		handleApplyExpression();
	};

	const handleCustomTags = (tagsList: unknown) => {
		customTagsAvailable = true;
		expressionsArray[currentExpressionIndex]['value'] = tagsList as string[];
	};
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css"
	/>
</svelte:head>
<div class="field is-flex is-justify-content-space-between is-align-items-center" style="">
	<span class="is-size-6 has-text-centered mx-1">One condition must be true</span>
	<Switch
		toggled={combineOperator}
		onchange={(toggled) => {
			combineOperator = toggled;
			handleCombineOperatorChanged();
		}}
	/>
	<span class="is-size-6 has-text-centered mx-1">All conditions must be true</span>
</div>

<div style="margin:10px" class="is-divider"></div>
<Wizard {initialStep}>
	<Step num={1}>
		{#snippet children({ nextStep })}
			<div class="wizard-button-container">
				<button
					onclick={() => {
						if (expressionsArray[0].value) {
							handleAddExpression();
						}
						nextStep();
					}}
					class="button is-small is-link has-text-weight-bold is-uppercase"
				>
					{expressionsArray[0].value ? 'Add' : 'New rule'}
				</button>
				{#if expressionApplied || expressionsArray[0].value !== ''}
					<button
						class="button is-small is-link has-text-weight-bold is-uppercase"
						aria-haspopup="true"
						aria-controls="dropdown-menu1"
						use:tippy={{ content: tooltipContent }}
					>
						<span>View</span>
						<span class="icon is-small">
							<i class="fas fa-angle-down" aria-hidden="true"></i>
						</span>
					</button>
					<div class="dropdown-content" bind:this={tooltipContent}>
						{#each expressionsArray as expr, i (expr.index)}
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
									></div>
								{/if}
							{/if}
						{/each}
					</div>

					<button
						onclick={handleClearExpression}
						class="button is-small is-primary has-text-weight-bold is-uppercase"
					>
						Clear filter{expressionsArray.length > 1 ? '(s)' : ''}
					</button>
				{/if}
			</div>
		{/snippet}
	</Step>
	<Step num={2}>
		{#snippet children({ nextStep, setStep })}
			<div class="wizard-button-container">
				{#if expressionsArray[currentExpressionIndex]['property']}
					<button
						title="move back to properties"
						onclick={() => {
							nextStep();
						}}
						class="button is-small is-link has-text-weight-bold is-uppercase"
					>
						<span>&nbsp;Operator</span>
						<span class="icon is-small">
							<i class="fa fa-angles-right"></i>
						</span>
					</button>
				{/if}
				<button
					onclick={() => {
						handleCancelExpression();
						setStep(1);
					}}
					class="ml-auto button is-small is-primary has-text-weight-bold is-uppercase"
				>
					Cancel
				</button>
			</div>
			<div class="pb-3 px-3">
				<PropertySelect
					onlyNumberFields={false}
					showEmptyFields={true}
					emptyFieldLabel="Select a property..."
					bind:propertySelectValue={expressionsArray[currentExpressionIndex].property}
					{layerId}
					parentId={layer.parentId}
					{metadata}
					onselect={(property: string) => {
						handlePropertySelect(property, nextStep);
					}}
				/>
			</div>
		{/snippet}
	</Step>
	<Step num={3}>
		{#snippet children({ prevStep, nextStep, setStep })}
			<!--      Pick one operation from the selected-->
			<div class="wizard-button-container">
				<button
					title="move back to properties"
					onclick={prevStep}
					class="button is-small is-link has-text-weight-bold is-uppercase"
				>
					<i class="fa fa-angles-left"></i>&nbsp;Properties
				</button>
				<button
					onclick={() => {
						handleCancelExpression();
						setStep(1);
					}}
					class="button is-small is-primary has-text-weight-bold is-uppercase"
				>
					Cancel
				</button>
			</div>
			<div class="is-divider separator is-danger" data-content="Select an operator..."></div>
			<div class="pb-3 px-3">
				<OperationButtons
					onenableTags={handleEnableTags}
					ondisableTags={handleDisableTags}
					bind:numberProperty
					bind:stringProperty
					bind:currentSelectedOperation={expressionsArray[currentExpressionIndex].operator}
					onchange={handleCurrentOperation}
					onclick={nextStep}
				/>
			</div>
		{/snippet}
	</Step>
	<Step num={4}>
		{#snippet children({ prevStep, setStep })}
			<!--      Pick one operation from the selected-->
			<div class="wizard-button-container">
				<button
					onclick={prevStep}
					title="move back to operators"
					class="button is-small is-link has-text-weight-bold is-uppercase"
				>
					<i class="fa fa-angles-left"></i> &nbsp;Operators
				</button>
				<button
					onclick={() => {
						handleCancelExpression();
						setStep(1);
					}}
					class="button is-small is-primary has-text-weight-bold is-uppercase"
				>
					Cancel
				</button>
			</div>

			<div class="is-divider separator is-danger" data-content="Select/input a value..."></div>
			<div class="pb-3 px-3">
				<ValueInput
					onapply={() => {
						handleApplyExpression();
						setStep(1);
					}}
					oncustomTags={handleCustomTags}
					bind:layer
					bind:acceptSingleTag
					bind:propertySelectedValue={expressionsArray[currentExpressionIndex]['property']}
					bind:expressionValue={expressionsArray[currentExpressionIndex]['value']}
					bind:operator={expressionsArray[currentExpressionIndex]['operator']}
				/>
			</div>
		{/snippet}
	</Step>
</Wizard>

<style lang="scss">
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

	:global(.style-editing-box) {
		margin: auto !important;
	}
</style>
