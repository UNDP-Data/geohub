<script lang="ts">
  import StepWizard from 'svelte-step-wizard'
  import { bannerMessages, map } from '$stores'
  import { ErrorMessages, StatusTypes } from '$lib/constants'
  import type { BannerMessage } from '$lib/types'
  import PropertySelectButtons from './vector-styles/PropertySelectButtons.svelte'
  import OperationButtons from '$components/controls/vector-styles/OperationButtons.svelte'
  import ValueInput from '$components/controls/vector-styles/ValueInput.svelte'

  export let isFilterPanelVisible = false
  export let layer

  const layerId = layer.definition.id

  // vars
  let currentExpressionIndex = 0

  let singleExpression = {
    index: 0,
    property: '',
    value: '',
    operator: '',
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  let expressionsArray: ({ property: string; index: number; filterValue: string; operator: string } | {})[] = [
    singleExpression,
  ]

  let selectedCombiningOperator
  let propertySelectValue = expressionsArray[currentExpressionIndex]['property']
  let filteringError = false
  let propertyStats
  let initialStep = 1
  let guard = 0
  $: console.log('propertyStats', propertyStats)

  const handlePropertySelect = (e) => {
    propertySelectValue = e.detail.prop
    // if (!propertySelectValue || propertySelectValue === '') return
    // currentExpressionIndex < 0 ? (currentExpressionIndex = 0) : currentExpressionIndex
    // if (propertySelectValue === '') return
    expressionsArray[currentExpressionIndex]['property'] = propertySelectValue
    layer.children['0'].info.stats.forEach((stat) => {
      if (stat.attribute === propertySelectValue) {
        propertyStats = stat
      }
    })
    expressionsArray[currentExpressionIndex]['propertyStats'] = propertyStats
  }

  const generateExpressionFromExpressionsArray = (expressionsArray) => {
    return expressionsArray.map((expression) => {
      if (expression['property'] === undefined) return
      if (expression['operation'] === undefined) return
      if (expression['value'] === undefined) return
      return [expression['operation'], ['get', expression['property']], Number(expression['value'])]
    })
  }

  const generateFilterExpression = (expressionsArray) => {
    const expression = generateExpressionFromExpressionsArray(expressionsArray)
    if (expression.length === 0) return
    if (expression.length === 1) return expression[0]
    return [selectedCombiningOperator, ...expression]
  }

  // Apply expression to layer
  const handleApplyExpression = () => {
    const expression = generateFilterExpression(expressionsArray)
    if (expression === undefined) {
      filteringError = true
      return
    }
    filteringError = false
    layer.definition.filter = expression
    $map.setFilter(layerId, expression)

    // if layer has labels, set filter on labels
    $map.getStyle().layers.filter((layer) => layer.id === `${layerId}-label`).length > 0
      ? $map.setFilter(`${layerId}-label`, expression)
      : null

    $map.on('error', (err: ErrorEvent) => {
      showBannerMessage(err.error)
    })
  }

  const showBannerMessage = (error: Error) => {
    // This error is thrown when the expression is not valid.
    filteringError = true
    const bannerErrorMessage: BannerMessage = {
      type: StatusTypes.WARNING,
      title: 'Whoops! Something went wrong.',
      message: ErrorMessages.MAP_FILTER_NOT_APPLIED,
      error,
    }
    bannerMessages.update((data) => [...data, bannerErrorMessage])
  }

  // Add an empty expression to the list of expressions when the plus(+) button is clicked
  const addExpression = () => {
    currentExpressionIndex = expressionsArray.length
    expressionsArray = [...expressionsArray, { index: currentExpressionIndex, property: '', operator: '', value: '' }]
  }

  // Clear all expressions applied to the layer and reset the UI
  const handleClearExpression = () => {
    $map.setFilter(layerId, null)
    currentExpressionIndex = 0
    expressionsArray = [
      {
        index: 0,
        property: '',
        value: '',
        operator: '',
      },
    ]
    expressionsArray.splice(currentExpressionIndex, 1, {})

    // Check if the filtered layer has a label layer and if true, remove the filter from the label layer
    $map.getStyle().layers.filter((layer) => layer.id === `${layerId}-label`).length > 0
      ? $map.setFilter(`${layerId}-label`, null)
      : null
  }

  const removeExistingExpressions = () => {
    // This function remove all the expressions from the expressions array
    // expressionsArray = expressionsArray.filter((expression) => expression['property'] !== undefined)
  }

  const handleCurrentOperation = (e) => {
    const operation = e.detail.operation
    console.log(operation)
    expressionsArray[currentExpressionIndex]['operation'] = operation
  }

  const handleAddExpression = () => {
    //pass
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css" />
</svelte:head>
{#if isFilterPanelVisible === true}
  <div class="field" style="margin: auto; display: flex; justify-content: space-between">
    <span class="condition-text">One condition must be true</span>
    <input id="switchExample" type="checkbox" name="switchExample" class="switch" checked />
    <label class="condition-text" for="switchExample">All conditions must be true</label>
  </div>
  <div style="margin:10px" class="is-divider" />
  {#key guard}
    <StepWizard initialStep={1}>
      <!--    Create new rule Step 1-->
      <StepWizard.Step num={1} let:nextStep>
        <div class="wizard-button-container">
          <button on:click={nextStep} class="button wizard-button is-small primary-button"> New Rule </button>
        </div>
      </StepWizard.Step>
      <StepWizard.Step num={2} let:previousStep let:nextStep>
        <div class="wizard-button-container">
          <button
            style="margin-left: auto"
            on:click={() => {
              guard = Math.random()
            }}
            class="button wizard-button is-small secondary-button">
            Cancel
          </button>
        </div>
        <PropertySelectButtons
          {layer}
          bind:propertySelectValue={expressionsArray[currentExpressionIndex].property}
          on:click={nextStep}
          on:select={handlePropertySelect} />
      </StepWizard.Step>
      <StepWizard.Step num={3} let:previousStep let:nextStep>
        <!--      Pick one operation from the selected-->
        <div class="wizard-button-container">
          <button on:click={previousStep} class="button wizard-button is-small primary-button">
            Select Property
          </button>
          <button
            on:click={() => {
              guard = Math.random()
            }}
            class="button wizard-button is-small secondary-button">
            Cancel
          </button>
        </div>
        <OperationButtons
          on:click={nextStep}
          bind:currentSelectedOperation={expressionsArray[currentExpressionIndex].operator}
          on:change={handleCurrentOperation} />
      </StepWizard.Step>
      <StepWizard.Step num={4} let:previousStep let:nextStep>
        <!--      Pick one operation from the selected-->
        <div class="wizard-button-container">
          <button on:click={previousStep} class="button wizard-button is-small primary-button"> Select rule </button>
        </div>
        <ValueInput
          bind:propertyStats={expressionsArray[currentExpressionIndex]['propertyStats']}
          bind:propertySelectedValue={expressionsArray[currentExpressionIndex]['property']}
          bind:expressionValue={expressionsArray[currentExpressionIndex]['value']} />
      </StepWizard.Step>
      <StepWizard.Step num={5} let:previousStep>
        <!--      Pick one operation from the selected-->
        <div class="wizard-button-container">
          <button on:click={previousStep} class="button wizard-button is-small primary-button">
            <i class="fa fa-chevron-left wizard-icon" />
            Value
          </button>
          <button on:click={addExpression} class="button wizard-button is-small primary-button"> Cancel </button>
        </div>
        <div class="block-buttons-group">
          <button on:click={handleApplyExpression} class="button wizard-button is-small primary-button">
            Apply Expression
          </button>
          <button
            style="margin-top: 5%"
            on:click={handleAddExpression}
            class="button wizard-button is-small primary-button">
            Add New Expression
          </button>
        </div>
      </StepWizard.Step>
    </StepWizard>
  {/key}
{/if}

<style lang="scss">
  @import 'bulma-slider/dist/css/bulma-slider.min.css';

  :global(.primary-button) {
    background: #d12800 !important;
    border-color: #d12800 !important;
    border-radius: 0px !important;
    color: white !important;
  }

  :global(.secondary-button) {
    background: #3288ce !important;
    border-color: #3288ce !important;
    border-radius: 0px !important;
    color: white !important;
  }

  :global(.other-button) {
    background: #b5d5f5 !important;
    border-color: #b5d5f5 !important;
    border-radius: 0px !important;
    color: white !important;
  }

  .wizard-icon {
    margin: 10%;
  }

  .filter-content {
    display: block;
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

  .wizard-button {
    border: none;
    color: white !important;
  }

  .condition-text {
    margin: 0px 5px;
    text-align: center;
  }
  .static-content-filter {
    margin: 5px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }

  .dynamic-content-filter {
    display: flex;
    margin-top: 5%;
    align-items: center;
    justify-content: space-between;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 2px;
  }
  :global(.style-editing-box) {
    margin: auto !important;
  }

  .block-buttons-group {
    display: block;
    width: min-content;
    margin: auto;
  }
  .buttons {
    width: max-content;
    margin: auto;
    margin-top: 5%;
  }
</style>
