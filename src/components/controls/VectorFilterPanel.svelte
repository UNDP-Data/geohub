<script lang="ts">
  import PropertySelect from '$components/controls/vector-styles/PropertySelect.svelte'
  import VectorFilterExpressionCreator from '$components/controls/vector-styles/VectorFilterExpressionCreator.svelte'
  import { bannerMessages, map } from '$stores'
  import { ErrorMessages, StatusTypes } from '$lib/constants'
  import type { BannerMessage } from '$lib/types'

  export let isFilterPanelVisible = false
  export let layer

  // vars
  let expression = ''
  let alteringIndex = 0
  let expressionsArray = [{}]
  let numbers = ''
  let selectedCombiningOperator
  let notificationShown = false
  let combiningOperatorTitle
  let propertySelectValue
  let filteringError = false
  let propertyStats = []

  const layerId = layer.definition.id
  const combiningOperators = [
    { title: 'AND', operation: 'all' },
    { title: 'OR', operation: 'any' },
    { title: 'NOR', operation: 'none' },
  ]

  const setDefaultProperty = (selectOptions: string[]) => {
    if (selectOptions.length === 0) return ''
    propertySelectValue = propertySelectValue === '' ? selectOptions[0] : propertySelectValue
    return propertySelectValue
  }

  const propertySelected = (e) => {
    propertySelectValue = e.detail.prop
    if (!propertySelectValue || propertySelectValue === '') return
    alteringIndex < 0 ? (alteringIndex = 0) : alteringIndex
    if (propertySelectValue === '') return
    expressionsArray[alteringIndex]['property'] = e.detail.prop
  }

  const operatorSelected = (e) => {
    alteringIndex < 0 ? (alteringIndex = 0) : alteringIndex
    expressionsArray[alteringIndex]['operator'] = e.detail.operator
  }

  $: alteringIndex, (numbers = '')
  $: expressionsArray, resetProperty()
  $: propertySelectValue, getMinMaxForProperty()

  // Every time the property is changed, get the min and max values for the property
  // for the purpose to display the min and max values to the user
  const getMinMaxForProperty = () => {
    if (propertySelectValue !== null) {
      const min = layer.info.json.tilestats.layers[0].attributes.filter(
        (attr) => attr.attribute === propertySelectValue,
      )[0].min
      const max = layer.info.json.tilestats.layers[0].attributes.filter(
        (attr) => attr.attribute === propertySelectValue,
      )[0].max
      propertyStats = [min == undefined ? '' : Math.floor(min), max == undefined ? '' : Math.ceil(max)]
    }
  }

  // reset properties when the last expression is removed
  const resetProperty = () => {
    if (Object.keys(expressionsArray[0]).length === 0) {
      $map.setFilter(layerId, null)
      propertySelectValue = null
      // Check if the filtered layer has a label layer and if true, remove the filter from the label layer
      $map.getStyle().layers.filter((layer) => layer.id === `${layerId}-label`).length > 0
        ? $map.setFilter(`${layerId}-label`, null)
        : null
    }
  }

  // If a number is selected, add it to the numbers string and to the under-edit expression
  const numberSelected = (e) => {
    numbers = numbers.concat(e.detail.number)
    expressionsArray[alteringIndex]['value'] = numbers
  }

  // Apply expression to layer
  const handleApplyExpression = () => {
    if (expressionsArray.length === 1) {
      //Simple Expression
      $map.setFilter(layerId, [
        expressionsArray[0]['operator'],
        ['get', expressionsArray[0]['property']],
        Number(expressionsArray[0]['value']),
      ])

      // Check if the label layer exists and if true, update the label layer with the new filter
      $map.getStyle().layers.filter((layer) => layer.id === `${layerId}-label`).length > 0
        ? $map.setFilter(`${layerId}-label`, [
            expressionsArray[0]['operator'],
            ['get', expressionsArray[0]['property']],
            Number(expressionsArray[0]['value']),
          ])
        : null
    } else if (expressionsArray.length > 1) {
      // complex expression
      const properties = expressionsArray.map((expression) => {
        return expression['property']
      })
      const operators = expressionsArray.map((expression) => {
        return expression['operator']
      })
      const values = expressionsArray.map((expression) => {
        return expression['value']
      })
      const expressions = []
      for (let i = 0; i < expressionsArray.length; i++) {
        expressions.push([operators[i], ['get', properties[i]], Number(values[i])])
      }
      $map.setFilter(layerId, [selectedCombiningOperator, ...expressions])
      // Check if the label layer exists and if true, update the label layer with the new filter
      $map.getStyle().layers.filter((layer) => layer.id === `${layerId}-label`).length > 0
        ? $map.setFilter(`${layerId}-label`, [selectedCombiningOperator, ...expressions])
        : null
    } else {
      // No expression
    }

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

  // Remove an operation/property/value from the expression when the x-button in the tag is clicked
  const removeOperation = (key, index) => {
    delete expressionsArray[index][String(key)]
    if (key === 'value') {
      numbers = ''
    }
    expressionsArray = [...expressionsArray]
    if (Object.keys(expressionsArray[index]).length < 1) {
      alteringIndex = alteringIndex - 1
      expressionsArray = [...expressionsArray.slice(0, index)]
      // if there is only one expression, enable all combining operator buttons
      if (expressionsArray.length < 2) {
        selectedCombiningOperator = null
      }
    }
  }

  // Clear all expressions applied to the layer and reset the UI
  const handleClearExpression = () => {
    $map.setFilter(layerId, null)
    alteringIndex = 0
    expressionsArray = [{}]
    expressionsArray.splice(alteringIndex, 1, {})
    numbers = ''
    // Check if the filtered layer has a label layer and if true, remove the filter from the label layer
    $map.getStyle().layers.filter((layer) => layer.id === `${layerId}-label`).length > 0
      ? $map.setFilter(`${layerId}-label`, null)
      : null
  }

  // Add an operator to an expression when one is clicked
  const handleOperatorClick = (op) => {
    combiningOperatorTitle = op.title
    selectedCombiningOperator = op.operation
    notificationShown = true
    if (expressionsArray.length === 1) {
      alteringIndex = expressionsArray.length
      expressionsArray = [...expressionsArray, { property: '', operator: '', value: '' }]
    }
  }

  // Add an empty expression to the list of expressions when the plus(+) button is clicked
  const addExpression = () => {
    alteringIndex = expressionsArray.length
    expressionsArray = [...expressionsArray, { property: '', operator: '', value: '' }]
    combiningOperatorTitle === null ? (combiningOperatorTitle = 'AND') : combiningOperatorTitle
  }

  // Remove a single expression from the expression. It does not reset map if the
  // expression was already applied
  const removeThisExpression = (exp) => {
    const index = expressionsArray.indexOf(exp)
    numbers = ''
    expressionsArray.splice(index, 1)
    alteringIndex = alteringIndex - 1
    expressionsArray = expressionsArray.length < 1 ? [...expressionsArray, {}] : [...expressionsArray]
  }

  // Switches the editable expression to the clicked
  // and enables the user to edit a single expression when the edit(button with pen) button is clicked
  const editThisExpression = (exp) => {
    alteringIndex = expressionsArray.indexOf(exp)
  }
</script>

{#if isFilterPanelVisible === true}
  <div style="display: block;">
    <div class="columns" style="align-items: center">
      <div style="width:70%; margin-left: 10%">
        <div>Property:</div>
        <PropertySelect
          bind:propertySelectValue
          on:select={propertySelected}
          {layer}
          showEmptyFields={false}
          showOnlyNumberFields={true}
          {setDefaultProperty} />
      </div>
      <VectorFilterExpressionCreator
        bind:layer
        bind:propertyStats
        on:numberselected={numberSelected}
        on:operatorselected={operatorSelected}
        bind:expression />
    </div>
    {#if expressionsArray.length > 0}
      <div style="display: block">
        {#each expressionsArray as expression, index}
          <div style="display: flex; align-items: center">
            {#if Object.keys(expression).length > 0}
              <span>{index + 1}: </span>
            {/if}
            <div id="expression-tags">
              {#each Object.keys(expression) as key}
                <div style="margin: 2px; display: flex; align-items: center; justify-content: space-around">
                  <span
                    class="tag is-small {key === 'property'
                      ? 'is-info'
                      : key === 'value'
                      ? 'is-warning'
                      : 'is-primary'}"
                    >{expression[key] !== '' ? expression[key] : ''}
                    <button on:click={() => removeOperation(key, index)} class="delete is-small" />
                  </span>
                </div>
              {/each}
            </div>
            {#if Object.keys(expression).length}
              <a style="text-decoration: none" on:click={() => removeThisExpression(expression)} class="tag is-small"
                ><i class="fa fa-trash" /></a>
              <a
                style="text-decoration: none"
                on:click={() => editThisExpression(expression)}
                class="tag is-small {index === alteringIndex ? 'is-danger' : ''}"><i class="fa fa-pen" /></a>
              {#if index === expressionsArray.length - 1}
                <a style="text-decoration: none" on:click={addExpression} class="tag is-small"
                  ><i class="fa fa-plus" /></a>
              {/if}
            {/if}
          </div>
          {#if selectedCombiningOperator !== undefined && expressionsArray[index + 1] !== undefined}
            <div style="margin-left: 30%" class="tag is-medium is-primary is-light">
              <span>{combiningOperatorTitle}</span>
            </div>
          {/if}
        {/each}
      </div>
      <div style="display: flex; align-items: center; justify-content: right; margin-top: 10%">
        {#each combiningOperators as operator}
          <button
            style="margin:1% {selectedCombiningOperator === operator.operation ? 'background:red' : 'background:blue'}"
            disabled={selectedCombiningOperator === operator.operation || expressionsArray.length < 1}
            class="button is-small other-button"
            on:click={() => {
              handleOperatorClick(operator)
            }}
            alt="Combining operator button"
            title="Combining operator button">{operator.title}</button>
        {/each}
        <button
          style="margin:1%;"
          class="button primary-button is-small"
          on:click={handleApplyExpression}
          alt="Apply expression button"
          title="Apply expression button"
          >Apply
        </button>
        <button
          style="margin:1%"
          class="button is-small secondary-button"
          on:click={handleClearExpression}
          alt="Apply expression button"
          title="Apply expression button">Clear</button>
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
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

  #expression-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    width: max-content;
    justify-content: space-around;
    max-width: 300px;
  }
</style>
