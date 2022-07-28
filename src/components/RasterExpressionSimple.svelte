<script lang="ts">
  import RasterExpressionBuilder from '$components/RasterExpressionBuilder.svelte'
  import { fade } from 'svelte/transition'
  import type { BannerMessage, Layer, RasterLayerStats, RasterTileMetadata } from '$lib/types'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import Popper from '$lib/popper'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import { fetchUrl, generateColorMap, getActiveBandIndex, updateParamsInURL } from '$lib/helper'
  import { DynamicLayerLegendTypes, ErrorMessages, StatusTypes } from '$lib/constants'
  import { bannerMessages, map } from '$stores'
  import { debounce } from 'lodash-es'

  export let layer: Layer

  let info: RasterTileMetadata
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ;({ info } = layer)

  const layerSrc = $map.getSource(layer.definition.source)
  const layerURL = new URL(layerSrc.tiles[0])
  const bandIndex = getActiveBandIndex(info)
  const band = `b${bandIndex + 1}`
  let showExpressionBuilder = false

  // Vars for expression
  let numbers = ''
  let expression = ''
  let simpleExpressionAvailable: boolean = layer.simpleExpressionAvailable || true
  let editingExpressionIndex = 0
  let expressions = layer.expressions || [{}]
  let combiningOperators = []

  // For complex expressions, ie the complex `where` expression
  // true and false statements
  let trueStatement = {
    underEdit: false,
    statement: '',
  }
  let falseStatement = {
    underEdit: false,
    statement: '',
  }
  // This var will populate the true and false statements
  let statement = ''

  // PopperJS
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

  // If change between the simple and complex expression, reset the numbers var
  // to an empty string
  $: simpleExpressionAvailable, (numbers = '')
  $: editingExpressionIndex, (numbers = '')
  $: expressions, (layer.expressions = expressions)

  // Whenever the arithmetic operator is clicked, add it to the operator
  // only when the simple expression is available. Complex expression will
  // not take any arithmetic operators.
  const handleArithmeticButtonClick = (event: CustomEvent) => {
    if (simpleExpressionAvailable) {
      if (event?.detail?.operator) {
        expressions[0].band = band
        expressions[0].operator = event.detail.operator
      }
    } else {
      // pass
    }
  }

  // Whenever the number is clicked, concatenate it to the numbers var
  const handleFunctionButtonClick = (event: CustomEvent) => {
    if (event?.detail?.operator) {
      expressions[editingExpressionIndex].band = band
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
      expressions[editingExpressionIndex].band = band
      expressions[editingExpressionIndex].operator = event.detail.operator
    }
    expression = expression.concat(event.detail.operator)
  }

  const handleWhereButtonClick = () => {
    simpleExpressionAvailable = false
    layer.simpleExpressionAvailable = simpleExpressionAvailable
    if (expressions.length === 1) {
      expressions[0] = {
        band: band,
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
        expressions[editingExpressionIndex].value = numbers
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
    try {
      if (simpleExpressionAvailable) {
        if (expressions[0].operator && expressions[0].value) {
          let updatedParams = {}

          const exprStatUrl = new URL(
            `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${layer.url}&expression=${encodeURIComponent(
              `${expressions[0].band}${expressions[0].operator}${expressions[0].value}`,
            )}`,
          )
          const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
          layer.info.stats = exprStats
          layer.expression = `${expressions[0].band},${expressions[0].operator},${expressions[0].value}`
          const band = Object.keys(exprStats)[bandIndex]
          updatedParams = { expression: layer.expression.replaceAll(',', '') }
          if (layer.legendType == DynamicLayerLegendTypes.CONTINUOUS) {
            updatedParams['rescale'] = [layer.info.stats[band].min, layer.info.stats[band].max]
            layer.continuous.minimum = Number(layer.info.stats[band].min)
            layer.continuous.maximum = Number(layer.info.stats[band].max)
          } else if (layer.legendType == DynamicLayerLegendTypes.INTERVALS) {
            layer.percentile98 = layer.info.stats[band].percentile_98
            layer.intervals.colorMapRows = generateColorMap(
              layer,
              layer.info.stats[band].min,
              layer.info.stats[band].max,
              layer.intervals.numberOfClasses,
              layer.intervals.classification,
              true,
              layer.info.stats[band].percentile_98,
            )
            handleParamsUpdate()
          }
          // Delete the expression in the url if already exists and update the url
          layerURL.searchParams.delete('expression')
          updateParamsInURL(layer.definition, layerURL, updatedParams)
        }
      } else {
        // simple expression is not available.
        let updatedParams = {}
        const expList = expressions.map((expr) => `(${expr.band}${expr.operator}${expr.value})`)
        const complexExpression = expList
          .map((item, index) => {
            if (index === 0) {
              return item
            } else {
              return `${combiningOperators[index - 1]} ${item}`
            }
          })
          .join('')

        const exprStatUrl = new URL(
          `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${layer.url}&expression=${encodeURIComponent(
            `where(${complexExpression}, ${trueStatement.statement}, ${falseStatement.statement});`,
          )}`,
        )
        const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
        layer.info.stats = exprStats
        layer.expression = `where(${complexExpression}, ${trueStatement.statement}, ${falseStatement.statement});`
        const band = Object.keys(exprStats)[bandIndex]
        updatedParams = { expression: layer.expression }
        if (layer.legendType == DynamicLayerLegendTypes.CONTINUOUS) {
          updatedParams['rescale'] = [layer.info.stats[band].min, layer.info.stats[band].max]
          layer.continuous.minimum = Number(layer.info.stats[band].min)
          layer.continuous.maximum = Number(layer.info.stats[band].max)
        }
        // Need to convert the legend type to unique values.
        layer.legendType = DynamicLayerLegendTypes.UNIQUE
        layer.info.band_metadata[bandIndex][1]['STATISTICS_UNIQUE_VALUES'] = [
          { value: Number(trueStatement.statement), name: trueStatement.statement },
          { value: Number(falseStatement.statement), name: falseStatement.statement },
        ]
        // ToDo: Set unique values to the layer with STATISTIC_UNIQUE_VALUES
        layerURL.searchParams.delete('expression')
        updateParamsInURL(layer.definition, layerURL, updatedParams)
      }
    } catch (e) {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.DANGER,
        title: 'Expression Error',
        message: ErrorMessages.EXPRESSION_INVALID,
        error: e,
      }
      bannerMessages.update((current) => [...current, bannerErrorMessage])
    }
  }

  const clearAppliedExpression = async () => {
    simpleExpressionAvailable = true
    editingExpressionIndex = 0
    expressions = [{}]
    expression = ''
    layer.expression = expression
    //handleApplyExpression()
    if (layerURL.searchParams.has('expression')) {
      let updatedParams = {}
      const statsUrl = new URL(`${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${layer.url}`)
      layer.info.stats = await fetchUrl(statsUrl.toString())
      const band = Object.keys(layer.info.stats)[bandIndex]
      if (layer.legendType == DynamicLayerLegendTypes.CONTINUOUS) {
        updatedParams['rescale'] = [layer.info.stats[band].min, layer.info.stats[band].max]
        layer.continuous.minimum = Number(layer.info.stats[band].min)
        layer.continuous.maximum = Number(layer.info.stats[band].max)
      } else if (layer.legendType == DynamicLayerLegendTypes.INTERVALS) {
        layer.intervals.colorMapRows = generateColorMap(
          layer,
          layer.info.stats[band].min,
          layer.info.stats[band].max,
          layer.intervals.numberOfClasses,
          layer.intervals.classification,
          true,
          layer.info.stats[band].percentile_98,
        )
        handleParamsUpdate()
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

  const addNewCondition = () => {
    expressions = [
      ...expressions,
      {
        band: band,
        operator: '',
        value: '',
      },
    ]
    editingExpressionIndex = expressions.length - 1
  }

  const removeConditionAtIndex = (index) => {
    expressions = expressions.filter((_, i) => i !== editingExpressionIndex)
    editingExpressionIndex = expressions.length - 1
    combiningOperators = combiningOperators.filter((_, i) => i !== index)
    if (expressions.length < 1) {
      numbers = ''
      combiningOperators = []
    }
  }

  const changeEditingIndexTo = (index) => {
    editingExpressionIndex = index
    numbers = ''
  }

  const handleParamsUpdate = debounce(() => {
    const encodeColorMapRows = JSON.stringify(
      layer.intervals.colorMapRows.map((row) => [[row.start, row.end], row.color]),
    )
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    const updatedParams = Object.assign({ colormap: encodeColorMapRows })
    updateParamsInURL(layer.definition, layerURL, updatedParams)
  }, 500)
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
            <span style="cursor: pointer; margin: .5%;" class="tag is-medium is-link">where </span>
            <button
              style="display: {expressions.length > 0 ? 'none' : ''}"
              on:click={addNewCondition}
              class="button is-small is-light is-primary"><i class="fa fa-plus" /></button>
          </div>
          {#each expressions as expression, index}
            <div style="display: block; width: 100%">
              <div style="display: flex; align-items: center">
                {#each Object.keys(expression) as oper}
                  <span class="tag is-medium is-warning" style="margin: .5%;">
                    {expression[`${oper}`]}
                  </span>
                {/each}
                <button on:click={() => removeConditionAtIndex(index)} class="button is-small is-light is-danger"
                  ><i class="fa fa-x" /></button>
                <button
                  on:click={() => changeEditingIndexTo(index)}
                  class="button is-small is-light {index === editingExpressionIndex ? 'is-info' : 'is-dark'}"
                  ><i class="fa fa-pen" /></button>
                <button
                  style="display: {index === expressions.length - 1 ? '' : 'none'}"
                  on:click={addNewCondition}
                  class="button is-small is-light is-primary"><i class="fa fa-plus" /></button>
              </div>
              <div
                style="width:20%; margin-left:30%; display: {index === expressions.length - 1 ? 'none' : ''}"
                class="tag is-small is-primary is-light">
                {combiningOperators[index] !== undefined ? combiningOperators[index] : ''}
              </div>
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
          bind:simpleExpressionAvailable
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
      <button
        style="display: {simpleExpressionAvailable ? 'none' : ''}"
        class="button is-primary is-light is-small"
        on:click={() => (combiningOperators = [...combiningOperators, '&'])}>
        AND
      </button>
      <button
        style="display: {simpleExpressionAvailable ? 'none' : ''}"
        class="button is-primary is-light is-small"
        on:click={() => (combiningOperators = [...combiningOperators, '|'])}>
        OR
      </button>
      <button
        style="display: {simpleExpressionAvailable ? 'none' : ''}"
        class="button is-primary is-light is-small"
        on:click={() => (combiningOperators = [...combiningOperators, '~'])}>
        NOT
      </button>
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
