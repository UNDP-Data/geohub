<script lang="ts">
  import PropertySelect from '$components/controls/vector-styles/PropertySelect.svelte'
  import { bannerMessages, map } from '$stores'
  import { ErrorMessages, StatusTypes } from '$lib/constants'
  import type { BannerMessage } from '$lib/types'
  import Popper from '$lib/popper'
  import VectorHistogram from '../VectorHistogram.svelte'
  import StyleControlGroup from '../control-groups/StyleControlGroup.svelte'

  export let isFilterPanelVisible = false
  export let layer

  const layerId = layer.definition.id

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right',
      strategy: 'fixed',
    },
    [10, 15],
  ).init()

  // vars
  let currentExpressionIndex = 0
  let showTooltip = false

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
  let propertySelectValue
  let filteringError = false
  let propertyStats

  const setDefaultProperty = (selectOptions: string[]) => {
    if (selectOptions.length === 0) return ''
    propertySelectValue = propertySelectValue === '' ? selectOptions[0] : propertySelectValue
    return propertySelectValue
  }

  const propertySelected = (e) => {
    propertySelectValue = e.detail.prop
    if (!propertySelectValue || propertySelectValue === '') return
    currentExpressionIndex < 0 ? (currentExpressionIndex = 0) : currentExpressionIndex
    if (propertySelectValue === '') return
    expressionsArray[currentExpressionIndex]['property'] = e.detail.prop
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

    // map.update((map) => {
    //   map.setFilter(layerId, expression)
    //   return map
    // })

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

  // Remove a single expression from the expression. It does not reset map if the
  // expression was already applied
  const removeLastExpression = () => {
    showTooltip = false
    const index = expressionsArray.length - 1
    expressionsArray.splice(index, 1)
    currentExpressionIndex = currentExpressionIndex - 1
    expressionsArray = expressionsArray.length < 1 ? [...expressionsArray, {}] : [...expressionsArray]
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
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css" />
</svelte:head>
{#if isFilterPanelVisible === true}
  <!--  <StyleControlGroup title="Define conditions" style="display: flex; align-items: center;">-->
  <span style="margin: auto;">Combine rules:</span>
  <div style="margin: auto;" class="select is-small">
    <select bind:value={selectedCombiningOperator}>
      <option value="all">All conditions must be true</option>
      <option value="any">At least one condition must be true</option>
    </select>
  </div>
  <div class="is-divider separator mb-3 mt-3" />
  <div class="static-content-filter">
    <button on:click={addExpression} class="button primary-button is-small">Add condition</button>
    <button on:click={removeLastExpression} class="button secondary-button is-small">Remove condition</button>
  </div>
  <div class="is-divider separator mb-3 mt-3" />

  <!--  </StyleControlGroup>-->
  <div style="display: flex; align-items: center;" use:popperRef>
    <div class="filter-content" style="width: 90%">
      {#each expressionsArray as expression, index}
        <div class="dynamic-content-filter">
          <PropertySelect
            style="margin-right:5%!important;"
            bind:propertySelectValue={expression.property}
            on:select={(e) => {
              propertySelected(e)
              currentExpressionIndex = index
            }}
            {layer}
            showEmptyFields={false}
            showOnlyNumberFields={true}
            {setDefaultProperty} />
          <div class="select is-small" style="margin-right:5%;">
            <select bind:value={expression.operation}>
              <option value="==">==</option>
              <option value="!=">!=</option>
              <option value="<">&#060;</option>
              <option value=">=">&#8805;</option>
              <option value=">">&#062; </option>
              <option value="<=">&#8804;</option>
              <option value="in">in</option>
              <option value="!in">!in</option>
              <option value="has">has</option>
              <option value="!has">!has</option>
            </select>
          </div>
          {#if showTooltip && expression.property && index === currentExpressionIndex}
            <div
              class="card tooltip"
              use:popperContent={popperOptions}
              style="width: max-content; height: fit-content; z-index:99999">
              <div id="card">
                <header style="padding: 5px; background: white; border: 0" class="modal-card-head">
                  <p class="modal-card-title has-text-weight-bold" />
                  <button
                    class="delete"
                    aria-label="close"
                    alt="Close Tooltip"
                    title="Close Tooltip"
                    on:click={() => (showTooltip = false)} />
                </header>
                <!--                Todo: If expression contains a property-->
                {#if expression.property !== '' && expression.propertyStats}
                  <div class="card-content">
                    <div class="content" style="width:100%; height:100%">
                      <!--  Todo: Need to check for existence of the `propertyStats` attribute in the expression -->
                      {#if expression.propertyStats.histogram}
                        <div style="display: block;">
                          <VectorHistogram
                            bind:histogram={expression.propertyStats.histogram}
                            bind:propertySelected={expression.property} />
                          <input
                            style="margin-left: auto; margin-right: auto;"
                            bind:value={expression.value}
                            class="slider is-fullwidth is-small"
                            step={(expression.propertyStats.histogram.bins[
                              expression.propertyStats.histogram.bins.length - 1
                            ] -
                              expression.propertyStats.histogram.bins[0]) /
                              10}
                            min={expression.propertyStats.histogram.bins[0]}
                            max={expression.propertyStats.histogram.bins[
                              expression.propertyStats.histogram.bins.length - 1
                            ]}
                            type="range" />
                          <input bind:value={expression.value} class="input is-small" type="text" placeholder="Value" />
                        </div>
                      {:else}
                        <div>Unique Values</div>
                        <div class="grid" style="width: fit-content">
                          <!--                        Todo: This has the unique values and should only set the value and/or replace-->
                          {#each expression.propertyStats.values as value}
                            <div class="grid-item">
                              <div class="grid-item-content">
                                <div class="grid-item-content-value">
                                  <button on:click={() => (expression.value = value)} class="button is-small is-primary"
                                    >{value}</button>
                                </div>
                              </div>
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
              <div id="arrow" data-popper-arrow />
            </div>
          {/if}
          <input
            bind:value={expression.value}
            on:click={() => (currentExpressionIndex === index ? (showTooltip = true) : (showTooltip = false))}
            style="width: 50%"
            class="input is-small"
            type="text"
            placeholder="Value" />
        </div>
      {/each}
      <div class="buttons">
        <button on:click={handleApplyExpression} class="button primary-button is-small apply">Apply</button>
        <button on:click={handleClearExpression} class="button secondary-button is-small clear">Clear</button>
      </div>
    </div>
  </div>
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

  #expression-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    width: max-content;
    justify-content: space-around;
    max-width: 300px;
  }

  .filter-content {
    display: block;
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
    justify-content: space-evenly;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 2px;
  }
  :global(.style-editing-box) {
    margin: auto !important;
  }

  .buttons {
    width: max-content;
    margin: auto;
    margin-top: 5%;
  }
</style>
