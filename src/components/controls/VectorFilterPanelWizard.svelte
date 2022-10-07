<script lang="ts">
  import { bannerMessages, map } from '$stores'
  import { ErrorMessages, StatusTypes } from '$lib/constants'
  import type { BannerMessage } from '$lib/types'
  import PropertySelectButtons from '$components/controls/vector-styles/PropertySelectButtons.svelte'
  import OperationButtons from '$components/controls/vector-styles/OperationButtons.svelte'
  import ValueInput from '$components/controls/vector-styles/ValueInput.svelte'
  import Wizard from '$components/control-groups/Wizard.svelte'
  import Step from '$components/control-groups/Step.svelte'

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

  let selectedCombiningOperator = 'all'
  let propertySelectValue = expressionsArray[currentExpressionIndex]['property']
  let filteringError = false
  let propertyStats
  let initialStep = 1
  let guard = 0
  let stringProperty = false
  let numberProperty = false
  let acceptSingleTag = true
  let expressionApplied = false
  let customTagsAvailable = false

  const handlePropertySelect = (e) => {
    propertySelectValue = e.detail.prop
    const dataType = layer.info.json.vector_layers[0].fields[propertySelectValue]
    if (dataType) {
      stringProperty = dataType === 'String'
      numberProperty = dataType === 'Number' || dataType.includes('int') || dataType.includes('float')
    }
    expressionsArray[currentExpressionIndex]['property'] = propertySelectValue
    layer.children['0'].info.stats.forEach((stat) => {
      if (stat.attribute === propertySelectValue) {
        propertyStats = stat
      }
    })
  }

  const generateExpressionFromExpressionsArray = (expressionsArray) => {
    let expressions = []
    return expressionsArray.map((expression) => {
      if (expression['property'] === undefined) return
      if (expression['operation'] === undefined) return
      if (expression['value'] === undefined) return
      if (customTagsAvailable) {
        if (expression['value'].length > 1) {
          if (expression['operation'] === 'in') {
            combineOperator = false
            expressions = expression['value'].map((val) => ['in', val, ['get', expression['property']]])
            return ['any', ...expressions]
          }
          if (expression['operation'] === '!in') {
            combineOperator = true
            expressions = expression['value'].map((val) => ['!', ['in', val, ['get', expression['property']]]])
            return ['all', ...expressions]
          }
        }
        if (expression['value'].length === 1) {
          if (expression['operation'] === 'in') {
            return ['in', expression['value'][0], ['get', expression['property']]]
          }
          if (expression['operation'] === '!in') {
            return ['!', ['in', expression['value'][0], ['get', expression['property']]]]
          }
        }
      } else {
        if (expression['operation'] === 'in') {
          return [expression['operation'], ['get', expression['property']], ['literal', expression['value']]]
        } else if (expression['operation'] === '!in') {
          return ['!', ['in', ['get', expression['property']], ['literal', expression['value']]]]
        } else {
          return [
            expression['operation'],
            ['get', expression['property']],
            isNaN(Number(expression['value'])) ? expression['value'][0] : Number(expression['value']),
          ]
        }
      }
    })
  }

  const generateFilterExpression = (expressionsArray) => {
    const expression = generateExpressionFromExpressionsArray(expressionsArray)
    if (expression.length === 0) return
    if (expression.length === 1) return expression[0]
    if (customTagsAvailable) return expression
    return [selectedCombiningOperator, ...expression]
  }

  // Apply expression to layer
  const handleApplyExpression = () => {
    expressionApplied = true
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

  // Clear all expressions applied to the layer and reset the UI
  const handleClearExpression = () => {
    expressionApplied = false
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
    // expressionsArray.splice(currentExpressionIndex, 1, {})

    // Check if the filtered layer has a label layer and if true, remove the filter from the label layer
    $map.getStyle().layers.filter((layer) => layer.id === `${layerId}-label`).length > 0
      ? $map.setFilter(`${layerId}-label`, null)
      : null
  }

  const handleCurrentOperation = (e) => {
    expressionsArray[currentExpressionIndex]['operation'] = e.detail.operation
  }

  const handleAddExpression = () => {
    currentExpressionIndex = currentExpressionIndex + 1
    expressionsArray = [...expressionsArray, { index: currentExpressionIndex, property: '', operator: '', value: '' }]
  }

  const setInitialExpression = () => {
    currentExpressionIndex = 0
    expressionsArray = [
      {
        index: 0,
        property: '',
        value: '',
        operator: '',
      },
    ]
  }
  const handleDisableTags = () => {
    acceptSingleTag = true
  }

  const handleEnableTags = () => {
    acceptSingleTag = false
  }

  let combineOperator = true

  $: {
    if (combineOperator) {
      selectedCombiningOperator = 'all'
    } else {
      selectedCombiningOperator = 'any'
    }
  }

  const handleCustomTags = (e) => {
    customTagsAvailable = true
    expressionsArray[currentExpressionIndex]['value'] = e.detail
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css" />
</svelte:head>
{#if isFilterPanelVisible === true}
  <div class="field" style="margin: auto; display: flex; justify-content: space-between">
    <span class="condition-text">One condition must be true</span>
    <input bind:checked={combineOperator} id="switchExample" type="checkbox" name="switchExample" class="switch" />
    <label class="condition-text" for="switchExample">All conditions must be true</label>
  </div>
  <div style="margin:10px" class="is-divider" />
  <Wizard initialStep={1}>
    <Step num={1} let:nextStep>
      <div class="wizard-button-container">
        <button
          on:click={() => {
            nextStep()
          }}
          class="button wizard-button is-small primary-button">
          <i class="fas fa-plus" />
          &nbsp; New rule
        </button>
        {#if expressionApplied || expressionsArray[0].value !== ''}
          <button on:click={handleClearExpression} class="button wizard-button is-small primary-button">
            <i class="fas fa-trash " />&nbsp;Clear filter{expressionsArray.length > 1 ? '(s)' : ''}
          </button>
        {/if}
      </div>
    </Step>
    <Step num={2} let:prevStep let:nextStep let:setStep>
      <div class="wizard-button-container">
        <!-- {#if expressionApplied || expressionsArray[0].value !== ''}
          <button on:click={handleClearExpression} class="button wizard-button is-small primary-button">
            Clear filter{expressionsArray.length > 1 ? 's' : ''}
          </button>
        {/if} -->
        <button
          on:click={() => {
            setInitialExpression()
            setStep(1)
          }}
          class="button wizard-button is-small primary-button">
          <i class="fa-solid fa-circle-xmark" /> &nbsp;Cancel
        </button>
        <button
          disabled={expressionsArray[currentExpressionIndex].property === ''}
          on:click={nextStep}
          class="button wizard-button is-small primary-button">
          Operators &nbsp;
          <i class="fa fa-chevron-right" />
        </button>
      </div>
      <div class="is-divider separator is-danger" data-content="Select a property..." />
      <PropertySelectButtons
        {layer}
        bind:propertySelectValue={expressionsArray[currentExpressionIndex].property}
        on:select={handlePropertySelect} />
    </Step>
    <Step num={3} let:prevStep let:nextStep let:setStep>
      <!--      Pick one operation from the selected-->
      <div class="wizard-button-container">
        <button on:click={prevStep} class="button wizard-button is-small primary-button">
          <i class="fa fa-chevron-left" />
          &nbsp; Properties
        </button>
        <button
          on:click={() => {
            setInitialExpression()
            setStep(1)
          }}
          class="button wizard-button is-small primary-button">
          <i class="fa-solid fa-circle-xmark" /> &nbsp;Cancel
        </button>
        <button
          disabled={expressionsArray[currentExpressionIndex].operator === ''}
          on:click={nextStep}
          class="button wizard-button is-small primary-button">
          Values &nbsp;
          <i class="fa fa-chevron-right" />
        </button>
      </div>
      <div class="is-divider separator is-danger" data-content="Select an operator..." />
      <OperationButtons
        on:enableTags={handleEnableTags}
        on:disableTags={handleDisableTags}
        bind:numberProperty
        bind:stringProperty
        bind:currentSelectedOperation={expressionsArray[currentExpressionIndex].operator}
        on:change={handleCurrentOperation} />
    </Step>
    <Step num={4} let:prevStep let:nextStep let:setStep>
      <!--      Pick one operation from the selected-->
      <div class="wizard-button-container">
        <button on:click={prevStep} class="button wizard-button is-small primary-button">
          <i class="fa fa-chevron-left" />
          &nbsp; Operators
        </button>
        <button
          on:click={() => {
            setInitialExpression()
            setStep(1)
          }}
          class="button wizard-button is-small primary-button">
          <i class="fa-solid fa-circle-xmark" /> &nbsp;Cancel
        </button>
      </div>

      <div class="is-divider separator is-danger" data-content="Select/input a value..." />
      <ValueInput
        on:apply={nextStep}
        on:customTags={handleCustomTags}
        bind:layer
        bind:acceptSingleTag
        bind:propertySelectedValue={expressionsArray[currentExpressionIndex]['property']}
        bind:expressionValue={expressionsArray[currentExpressionIndex]['value']} />
    </Step>

    <Step num={5} let:prevStep let:setStep>
      <!--      Pick one operation from the selected-->
      <div class="wizard-button-container">
        <button on:click={prevStep} class="button wizard-button is-small primary-button">
          <i class="fa fa-chevron-left" />
          &nbsp; Previous
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
  </Wizard>
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;

    width: min-content;
    margin: auto;
  }
  .buttons {
    width: max-content;
    margin: auto;
    margin-top: 5%;
  }
</style>
