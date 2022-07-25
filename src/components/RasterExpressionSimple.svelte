<script lang="ts">
  import RasterExpressionBuilder from '$components/RasterExpressionBuilder.svelte'
  import { fade } from 'svelte/transition'
  import type { Layer, RasterLayerStats } from '$lib/types'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import Popper from '$lib/popper'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import { fetchUrl, updateParamsInURL } from '$lib/helper'
  import { DynamicLayerLegendTypes } from '$lib/constants'
  import { map } from '$stores'
  export let layer: Layer

  const layerSrc = $map.getSource(layer.definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let showExpressionBuilder = false
  let numbers = ''
  let expression = ''
  let simpleExpressionAvailable = layer.simpleExpressionAvailable || true
  let simpleExpression = {}
  let complexExpressions = [{}]
  let underEditIndex = 0
  let editingExpressionIndex = 0
  complexExpressions[editingExpressionIndex].band = 'band1 '
  let selectedIndex

  let expressions = [{}]

  let trueStatement = {
    underEdit: false,
    statement: '',
  }
  let falseStatement = {
    underEdit: false,
    statement: '',
  }
  let statement = ''

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-end',
      strategy: 'fixed',
      padding: 0,
      margin: 0,
    },
    [10, 15],
  ).init()

  $: simpleExpressionAvailable, (numbers = '')

  const handleArithmeticButtonClick = (event: CustomEvent) => {
    if (simpleExpressionAvailable) {
      if (event?.detail?.operator) {
        expressions[0].band = 'band1 '
        expressions[0].operator = event.detail.operator
      }
    } else {
      // pass
    }
  }

  const handleFunctionButtonClick = (event: CustomEvent) => {
    if (simpleExpressionAvailable) {
      if (event?.detail?.operator) {
        const operator = event.detail.operator
        numbers = numbers.concat(operator)
        expressions[0].band = 'band1 '
        expressions[0].value = numbers
        console.log(expressions)
        // simpleExpression.band = 'band1 '
        // simpleExpression.value = numbers
      }
    } else {
      const operator = event.detail.operator
      numbers = numbers.concat(operator)
      expressions[editingExpressionIndex].band = 'band1 '
      expressions[editingExpressionIndex].value = numbers
      if (trueStatement.underEdit) {
        statement = statement.concat(event.detail.operator)
        trueStatement.statement = statement
      } else if (falseStatement.underEdit) {
        falseStatement.statement = falseStatement.statement.concat(event.detail.operator)
      } else {
        numbers = numbers.concat(event.detail.operator)
        expressions[editingExpressionIndex].value = numbers
      }
    }
  }
  const handleComparisonButtonClick = (event: CustomEvent) => {
    if (simpleExpressionAvailable) {
      // comparison operator is not available in simple expression.
    } else {
      expressions[editingExpressionIndex].band = 'band1 '
      expressions[editingExpressionIndex].operator = event.detail.operator
      // complexExpressions[editingExpressionIndex].operator = event.detail.operator
    }
    expression = expression.concat(event.detail.operator)
  }

  const handleWhereButtonClick = () => {
    simpleExpressionAvailable = false
    layer.simpleExpressionAvailable = simpleExpressionAvailable
    if (expressions.length === 1) {
      expressions[0] = {
        band: 'band1 ',
        operator: '',
        value: '',
      }
    }
  }

  const handleNumberButtonClick = (event: CustomEvent) => {
    expression = expression.concat(numbers).concat(',')
    if (simpleExpressionAvailable) {
      if (event?.detail?.operator) {
        numbers = numbers.concat(event.detail.operator)
        // simpleExpression.value = numbers
        expressions[editingExpressionIndex].band = 'b1 '
        expressions[editingExpressionIndex].value = numbers
        console.log(expressions)
      }
    } else {
      if (trueStatement.underEdit) {
        trueStatement.statement = trueStatement.statement.concat(event.detail.operator)
      } else if (falseStatement.underEdit) {
        falseStatement.statement = falseStatement.statement.concat(event.detail.operator)
      } else {
        numbers = numbers.concat(event.detail.operator)
        expressions[editingExpressionIndex].value = numbers
      }
    }
  }

  const applyExpression = async () => {
    if (simpleExpressionAvailable) {
      if (expressions[0].operator && expressions[0].value) {
        let updatedParams = {}

        const exprStatUrl = new URL(
          `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${layer.url}&expression=${encodeURIComponent(
            `${expressions[0].band}${expressions[0].operator}${expressions[0].value}`,
          )}`,
        )
        console.log(exprStatUrl)
        const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
        layer.info.stats = exprStats
        layer.expression = `${expressions[0].band},${expressions[0].operator},${expressions[0].value}`
        const band = Object.keys(exprStats)[0]
        updatedParams = { expression: layer.expression.replaceAll(',', '') }
        if (layer.legendType == DynamicLayerLegendTypes.CONTINUOUS) {
          updatedParams['rescale'] = [layer.info.stats[band].min, layer.info.stats[band].max]
          layer.continuous.minimum = Number(layer.info.stats[band].min)
          layer.continuous.maximum = Number(layer.info.stats[band].max)
        }
        layerURL.searchParams.delete('expression')
        updateParamsInURL(layer.definition, layerURL, updatedParams)
      }
    } else {
      // simple expression is not available.
      let updatedParams = {}
      const exprStatUrl = new URL(
        `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${layer.url}&expression=${encodeURIComponent(
          `where(b1${complexExpressions[0].operator}${complexExpressions[0].value}, ${trueStatement.statement}, ${falseStatement.statement});`,
        )}`,
      )
      const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
      layer.info.stats = exprStats
      layer.expression = `where(${complexExpressions[0].band}${complexExpressions[0].operator}${complexExpressions[0].value}, ${trueStatement.statement}, ${falseStatement.statement});`
      const band = Object.keys(exprStats)[0]
      updatedParams = { expression: layer.expression }
      if (layer.legendType == DynamicLayerLegendTypes.CONTINUOUS) {
        updatedParams['rescale'] = [layer.info.stats[band].min, layer.info.stats[band].max]
        layer.continuous.minimum = Number(layer.info.stats[band].min)
        layer.continuous.maximum = Number(layer.info.stats[band].max)
      }
      layerURL.searchParams.delete('expression')
      updateParamsInURL(layer.definition, layerURL, updatedParams)
    }
  }

  const clearAppliedExpression = async () => {
    simpleExpressionAvailable = true
    expressions = [{}]
    const layerSrc = $map.getSource(layer.definition.source)
    const layerURL = new URL(layerSrc.tiles[0])
    expression = ''
    layer.expression = expression
    //handleApplyExpression()
    if (layerURL.searchParams.has('expression')) {
      let updatedParams = {}
      const statsUrl = new URL(`${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${layer.url}`)
      layer.info.stats = await fetchUrl(statsUrl.toString())
      const band = Object.keys(layer.info.stats)[0]
      if (layer.legendType == DynamicLayerLegendTypes.CONTINUOUS) {
        updatedParams['rescale'] = [layer.info.stats[band].min, layer.info.stats[band].max]
        layer.continuous.minimum = Number(layer.info.stats[band].min)
        layer.continuous.maximum = Number(layer.info.stats[band].max)
      }
      layerURL.searchParams.delete('expression')
      updateParamsInURL(layer.definition, layerURL, updatedParams)
    }
  }

  const handleRemoveItem = (key) => {
    if (simpleExpressionAvailable) {
      key === 'value' ? (numbers = '') : null
      delete expressions[0][key]
      expressions = expressions
    }
  }

  const removeWhereExpression = () => {
    simpleExpressionAvailable = true
    expressions = [{}]
  }

  const addNewCondition = () => {
    expressions = [
      ...expressions,
      {
        band: 'b1 ',
        operator: '',
        value: '',
      },
    ]
    editingExpressionIndex = expressions.length - 1
  }
  const removeConditionAtIndex = (index) => {
    expressions = expressions.filter((_, i) => i !== editingExpressionIndex)
    editingExpressionIndex = expressions.length - 1
    expressions.length < 1 ? (numbers = '') : null
  }

  const changeEditingIndexTo = (index) => {
    editingExpressionIndex = index
    numbers = ''
  }
</script>

<div class="container">
  <div class="columns">
    <div class="column is-10" style="border: 1px dotted #e6e9f7">
      {#if simpleExpressionAvailable}
        {#each Object.keys(expressions[0]) as key}
          <span
            style="cursor: pointer; margin: 1%;"
            class="tag is-large {key === 'band' ? 'is-primary' : key === 'operator' ? 'is-danger' : 'is-warning'}">
            {expressions[0][`${key}`]}
            <button
              style="display:{key === 'band' ? 'none' : null}"
              on:click={() => handleRemoveItem(key)}
              class="delete is-small" />
          </span>
        {/each}
      {:else}
        <div class="column" style="width: 90%; margin: auto">
          <div style="width: 50%; margin: auto; display: flex; align-items: center; justify-content: space-evenly">
            <span style="cursor: pointer; margin: 1%;" class="tag is-large is-link">where </span>
            <button on:click={addNewCondition} class="button is-small is-light is-primary"
              ><i class="fa fa-plus" /></button>
          </div>

          {#each expressions as expression, index}
            <div style="display: flex; align-items: center">
              {#each Object.keys(expression) as oper}
                <span
                  class="tag is-medium {editingExpressionIndex === index ? 'is-warning' : 'is-dark'}"
                  style="margin: 2%; border: {editingExpressionIndex === index ? '1px solid red' : null}">
                  {expression[`${oper}`]}
                </span>
              {/each}
              <button on:click={() => removeConditionAtIndex(index)} class="button is-small is-light is-primary"
                ><i class="fa fa-x" /></button>
              <button on:click={() => changeEditingIndexTo(index)} class="button is-small is-light is-primary"
                ><i class="fa fa-pen" /></button>
            </div>
          {/each}
        </div>
        <div style="display: flex; justify-content: space-evenly">
          <span
            on:click={() => {
              trueStatement.underEdit = !trueStatement.underEdit
            }}
            style="cursor:pointer; border: {trueStatement.underEdit ? '2px solid blue' : 'none'}"
            class="tag is-medium is-success">
            {trueStatement.statement.length > 0 ? trueStatement.statement : ''}
            <button on:click={() => (trueStatement.statement = '')} class="delete is-small" />
          </span>
          <span
            on:click={() => {
              falseStatement.underEdit = !falseStatement.underEdit
            }}
            style="cursor:pointer; border: {falseStatement.underEdit ? '2px solid blue' : 'none'}"
            class="tag is-medium is-danger"
            >{falseStatement.statement.length > 0 ? falseStatement.statement : ''}
            <button on:click={() => (falseStatement.statement = '')} class="delete is-small" />
          </span>
        </div>
      {/if}
    </div>
    <div class="column is-3">
      <div
        style="width: 50%"
        on:click={() => {
          showExpressionBuilder = !showExpressionBuilder
        }}
        data-testid="expression-builder-button"
        use:popperRef>
        <Wrapper>
          <Card>
            <PrimaryAction style="padding: 10px;">
              <Fa icon={faCalculator} style="font-size: 16px;" />
            </PrimaryAction>
          </Card>
          <Tooltip showDelay={100} hideDelay={0} yPos="above">Expression builder</Tooltip>
        </Wrapper>
      </div>
    </div>
    {#if showExpressionBuilder}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <RasterExpressionBuilder
          on:handleComparisonButtonClick={handleComparisonButtonClick}
          on:handleFunctionButtonClick={handleFunctionButtonClick}
          on:handleArithmeticButtonClick={handleArithmeticButtonClick}
          on:handleNumberButtonClick={handleNumberButtonClick}
          on:handleWhereFunctionClick={handleWhereButtonClick}
          on:handleClosePopup={() => {
            showExpressionBuilder = !showExpressionBuilder
          }}
          {layer} />
      </div>
    {/if}
  </div>
  <div class="columns" style="width: 100%">
    <div class="column" style="width: 100%; justify-content: space-between">
      <button class="button is-primary is-light is-small" on:click={() => console.log('AND')}> AND </button>
      <button class="button is-primary is-light is-small" on:click={() => console.log('OR')}> OR </button>
      <button class="button is-primary is-light is-small" on:click={() => console.log('NOT')}> NOT </button>
      <button
        class="button is-info is-light is-small"
        on:click={applyExpression}
        alt="Apply expression"
        title="Apply expression">
        Apply
      </button>
      <button
        class="button is-info is-light is-small"
        on:click={clearAppliedExpression}
        alt="Clear expression"
        title="Clear expression">
        Clear
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  @import '../styles/popper.scss';
  #tooltip {
    max-height: 300px;
    max-width: 600px;
  }
</style>
