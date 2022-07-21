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

  let complexExpression = 'where,'
  let complexExpressions = [{}]
  let simpleExpressionEditingIndex = 0
  complexExpressions[simpleExpressionEditingIndex].band = 'b1'
  let selectedIndex
  let trueStatement = {
    status: false,
    statement: '',
  }
  let falseStatement = {
    status: false,
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

  const handleArithmeticButtonClick = (event: CustomEvent) => {
    if (simpleExpressionAvailable) {
      if (event?.detail?.operator) {
        simpleExpression.band = 'b1'
        simpleExpression.operator = event.detail.operator
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
        simpleExpression.band = 'b1'
        simpleExpression.value = numbers
      }
    } else {
      if (trueStatement.status) {
        statement = statement.concat(event.detail.operator)
        trueStatement.statement = statement
      } else if (falseStatement.status) {
        falseStatement.statement = falseStatement.statement.concat(event.detail.operator)
      } else {
        numbers = numbers.concat(event.detail.operator)
        complexExpressions[simpleExpressionEditingIndex].value = numbers
      }
    }
  }
  const handleComparisonButtonClick = (event: CustomEvent) => {
    if (simpleExpressionAvailable) {
      complexExpressions[simpleExpressionEditingIndex].band = 'b1'
      complexExpressions[simpleExpressionEditingIndex].operator = event.detail.operator
      // pass
    } else {
      complexExpressions[simpleExpressionEditingIndex].operator = event.detail.operator
      complexExpression = complexExpression.concat(event.detail.operator).concat(',')
    }
    expression = expression.concat(event.detail.operator)
  }

  const handleWhereButtonClick = () => {
    simpleExpressionAvailable = false
    layer.simpleExpressionAvailable = simpleExpressionAvailable
    simpleExpression = {}
    complexExpression = 'where'
  }

  const handleNumberButtonClick = (event: CustomEvent) => {
    expression = expression.concat(numbers).concat(',')
    if (simpleExpressionAvailable) {
      if (event?.detail?.operator) {
        numbers = numbers.concat(event.detail.operator)
        simpleExpression.value = numbers
      }
    } else {
      // Now that the where function is available, we check for the status of the true and false statements
      if (trueStatement.status) {
        statement = statement.concat(event.detail.operator)
        trueStatement.statement = statement
      } else if (falseStatement.status) {
        falseStatement.statement = falseStatement.statement.concat(event.detail.operator)
      } else {
        numbers = numbers.concat(event.detail.operator)
        complexExpressions[simpleExpressionEditingIndex].value = numbers
      }
    }
  }

  const applyExpression = async () => {
    if (simpleExpressionAvailable) {
      if (simpleExpression.operator && simpleExpression.value) {
        let updatedParams = {}
        const exprStatUrl = new URL(
          `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${layer.url}&expression=${encodeURIComponent(
            `${simpleExpression.band}${simpleExpression.operator}${simpleExpression.value}`,
          )}`,
        )
        const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
        layer.info.stats = exprStats
        layer.expression = `${simpleExpression.band},${simpleExpression.operator},${simpleExpression.value}`
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
          `where(${complexExpressions[0].band}${complexExpressions[0].operator}${complexExpressions[0].value}, ${trueStatement.statement}, ${falseStatement.statement});`,
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
    simpleExpression = {}
    complexExpressions = [{}]
  }

  const makeSelected = (item) => {
    if (simpleExpressionAvailable) {
      selectedIndex = Object.keys(simpleExpression).indexOf(item)
    } else {
      selectedIndex = Object.keys(complexExpression).indexOf(item)
    }
  }

  const handleRemoveItem = (key) => {
    key === 'value' ? (numbers = '') : null
    delete simpleExpression[key]
    simpleExpression = simpleExpression
  }
</script>

<div class="container">
  <div class="columns">
    <div class="column is-9" style="border: 1px dotted #e6e9f7">
      {#if simpleExpressionAvailable}
        {#each Object.keys(simpleExpression) as key}
          <span
            style="cursor: pointer; margin: 1%; display: {simpleExpression[key] ? '' : 'none'}"
            class="tag is-medium {key === 'band' ? 'is-primary' : key === 'operator' ? 'is-danger' : 'is-warning'}">
            {simpleExpression[key]}
            <button
              style="display:{key === 'band' ? 'none' : null}"
              on:click={() => handleRemoveItem(key)}
              class="delete is-small" />
          </span>
        {/each}
      {:else}
        <span style="cursor: pointer; margin: 1%;" class="tag is-medium is-link"
          >where
          <button on:click={() => (simpleExpressionAvailable = true)} class="delete is-small" />
        </span>
        {#each complexExpressions as expression, index}
          <span
            on:click={() => makeSelected(expression)}
            style="cursor: pointer; margin: 1%;"
            class="tag is-warning is-medium {selectedIndex === index ? 'is-danger' : 'is-success'}">
            {expression.band ? expression.band : 'b1'}
            {expression.operator ? expression.operator : ''}
            {expression.value ? expression.value : ''}
            <button on:click={() => (complexExpressions[0] = {})} class="delete is-small" />
          </span>
          <span
            on:click={() => (trueStatement.status = !trueStatement.status)}
            style="cursor:pointer; border: {trueStatement.status ? '2px solid blue' : 'none'}"
            class="tag is-medium is-success">
            {trueStatement.statement.length > 0 ? trueStatement.statement : ''}
            <button on:click={() => (trueStatement.statement = '')} class="delete is-small" />
          </span>
          <span
            on:click={() => (falseStatement.status = !falseStatement.status)}
            style="cursor:pointer; border: {falseStatement.status ? '2px solid blue' : 'none'}"
            class="tag is-medium is-danger"
            >{falseStatement.statement.length > 0 ? falseStatement.statement : ''}
            <button on:click={() => (falseStatement.statement = '')} class="delete is-small" />
          </span>
        {/each}
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
