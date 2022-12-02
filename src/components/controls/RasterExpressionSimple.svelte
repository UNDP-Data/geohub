<script lang="ts">
  import RasterExpressionBuilder from '$components/controls/RasterExpressionBuilder.svelte'
  import { fade } from 'svelte/transition'
  import type { BannerMessage, Layer, RasterLayerStats, RasterSimpleExpression, RasterTileMetadata } from '$lib/types'
  import Fa from 'svelte-fa'
  import Popper from '$lib/popper'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import {
    fetchUrl,
    getActiveBandIndex,
    getLayerStyle,
    getLayerUrl,
    getValueFromRasterTileUrl,
    updateParamsInURL,
  } from '$lib/helper'
  import { COLOR_CLASS_COUNT_MAXIMUM, DynamicLayerLegendTypes, ErrorMessages, StatusTypes } from '$lib/constants'
  import { bannerMessages, layerList, map } from '$stores'
  import type { RasterTileSource } from 'maplibre-gl'

  export let layer: Layer
  export let expressions: RasterSimpleExpression[] = []
  export let legendType: DynamicLayerLegendTypes

  let info: RasterTileMetadata
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ;({ info } = layer)

  const bandIndex = getActiveBandIndex(info)
  const band = `b${bandIndex + 1}`
  let showExpressionBuilder = false

  // Vars for expression
  let numbers = ''
  let expression = ''
  let simpleExpressionAvailable = true
  let editingExpressionIndex = 0
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
      placement: 'right',
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

  // Whenever the arithmetic operator is clicked, add it to the operator
  // only when the simple expression is available. Complex expression will
  // not take any arithmetic operators.
  const handleArithmeticButtonClick = (event: CustomEvent) => {
    if (simpleExpressionAvailable) {
      if (event?.detail?.operator) {
        const expr = {
          band,
          operator: event.detail.operator,
        }
        if (expressions.length === 0) {
          expressions.push(expr)
        } else {
          expressions[0] = expr
        }
      }
    } else {
      // pass
    }
  }

  // Whenever the function is clicked, concatenate it to the numbers var
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

  // Whenever the comparison operator is clicked, update the expression object in the operator property
  const handleComparisonButtonClick = (event: CustomEvent) => {
    if (simpleExpressionAvailable) {
      // comparison operator is not available in simple expression.
    } else {
      expressions[editingExpressionIndex].band = band
      expressions[editingExpressionIndex].operator = event.detail.operator
    }
    expression = expression.concat(event.detail.operator)
  }

  // Whenever the where button is clicked, create a new complex expression
  const handleWhereButtonClick = () => {
    simpleExpressionAvailable = false
    if (expressions.length === 1) {
      expressions[0] = {
        band: band,
        operator: '',
        value: '',
      }
    }
  }

  // Whenever the number button is clicked, concatenate it to the numbers
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

  // Apply the expression
  const applyExpression = async () => {
    try {
      const layerStyle = getLayerStyle($map, layer.id)
      const layerSrc: RasterTileSource = $map.getSource(layerStyle.source) as RasterTileSource
      const layerURL = new URL(layerSrc.tiles[0])
      if (simpleExpressionAvailable) {
        if (expressions.length > 0 && expressions[0].operator && expressions[0].value) {
          let updatedParams = {}

          const exprStatUrl = new URL(
            `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${getLayerUrl(
              $map,
              layer.id,
            )}&expression=${encodeURIComponent(
              `${expressions[0].band}${expressions[0].operator}${expressions[0].value}`,
            )};`,
          )
          // console.log(exprStatUrl)
          const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
          info.stats = exprStats
          const expression = `${expressions[0].band},${expressions[0].operator},${expressions[0].value}`
          const band = Object.keys(exprStats)[bandIndex]
          updatedParams = { expression: expression.replaceAll(',', '') }

          updatedParams['rescale'] = [layer.info.stats[band].min, layer.info.stats[band].max]

          // Delete the expression in the url if already exists and update the url
          layerURL.searchParams.delete('expression')
          updateParamsInURL(layerStyle, layerURL, updatedParams)
          const nlayer = { ...layer, info: info }
          const layers = $layerList.map((lyr) => {
            return layer.id !== lyr.id ? lyr : nlayer
          })
          layerList.set([...layers])
        }
      } else {
        // simple expression is not available.
        let updatedParams = {}
        const expList = expressions.map((expr) => `(${expr.band}${expr.operator}${expr.value})`)

        // This will combine the user inputs into one big complex expression string
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
          `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${getLayerUrl(
            $map,
            layer.id,
          )}&expression=${encodeURIComponent(
            `where(${complexExpression}, ${trueStatement.statement}, ${falseStatement.statement});`,
          )}&categorical=true`,
        )

        const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
        console.log(exprStats)
        info.stats = exprStats
        const expression = `where(${complexExpression}, ${trueStatement.statement}, ${falseStatement.statement});`
        const band = Object.keys(exprStats)[bandIndex]
        updatedParams = { expression: expression }
        updatedParams['rescale'] = [info.stats[band].min, info.stats[band].max]
        layerURL.searchParams.delete('expression')
        updateParamsInURL(layerStyle, layerURL, updatedParams)

        const nlayer = { ...layer, info: info }
        const layers = $layerList.map((lyr) => {
          return layer.id !== lyr.id ? lyr : nlayer
        })
        layerList.set([...layers])
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

  // Clear the expression, reset the map, legend and other relevant components to the initial state when without the expression
  const clearAppliedExpression = async () => {
    simpleExpressionAvailable = true
    editingExpressionIndex = 0
    expressions = []
    expression = ''

    const layerStyle = getLayerStyle($map, layer.id)
    const layerSrc: RasterTileSource = $map.getSource(layerStyle.source) as RasterTileSource
    const layerURL = new URL(layerSrc.tiles[0])
    if (layerURL.searchParams.has('expression')) {
      let updatedParams = {}
      const statsUrl = new URL(
        `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${getLayerUrl($map, layer.id)}`,
      )
      info.stats = await fetchUrl(statsUrl.toString())
      const band = info.active_band_no
      const bandName = Object.keys(layer.info.stats)

      updatedParams['rescale'] = [info.stats[band].min, info.stats[band].max]

      layerURL.searchParams.delete('expression')
      if (Number(info.stats[bandName].unique) > COLOR_CLASS_COUNT_MAXIMUM) {
        layerURL.searchParams.delete('colormap')
        const colorMapName = getValueFromRasterTileUrl($map, layer.id, 'colormap_name') as string
        layerURL.searchParams.set('colormap_name', colorMapName)
        legendType = DynamicLayerLegendTypes.CONTINUOUS
      }
      layerURL.searchParams.delete('rescale')
      layerURL.searchParams.delete('expression')
      updateParamsInURL(layerStyle, layerURL, updatedParams)
    }
  }

  // Remove a single tag when the x icon is clicked
  const handleRemoveItem = (key) => {
    if (simpleExpressionAvailable) {
      key === 'value' ? (numbers = '') : null
      delete expressions[0][key]
      expressions = expressions
    }
  }

  // For complex exressiosn, add a new condition to the array of expression
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

  // remove an entire expression when the X button is available in the case of complex expressions
  const removeConditionAtIndex = (index) => {
    expressions = expressions.filter((_, i) => i !== editingExpressionIndex)
    editingExpressionIndex = expressions.length - 1
    combiningOperators = combiningOperators.filter((_, i) => i !== index)
    if (expressions.length < 1) {
      numbers = ''
      combiningOperators = []
    }
  }

  // Change the editable expression to the most recent one where the button with pen icon is clicked
  const changeEditingIndexTo = (index) => {
    trueStatement.underEdit = false
    falseStatement.underEdit = false
    editingExpressionIndex = index
    numbers = ''
  }

  const handleEnterKey = (e: any) => {
    if (e.key === 'Enter') {
      e.target.click()
    }
  }
</script>

<div class="container">
  <div class="columns">
    <div
      class="column is-10"
      style="border: 1px dotted #e6e9f7">
      {#if simpleExpressionAvailable}
        {#if expressions && expressions.length > 0}
          {#each Object.keys(expressions[0]) as key}
            <span
              style="cursor: pointer; margin: 1%;"
              tabindex="0"
              class="tag is-medium {key === 'band' ? 'is-primary' : key === 'operator' ? 'is-danger' : 'is-warning'}">
              {expressions[0][`${key}`]}
              <button
                style="display:{key === 'band' ? 'none' : null}"
                on:click={() => handleRemoveItem(key)}
                class="delete is-small" />
            </span>
          {/each}
        {/if}
      {:else}
        <div
          class="column"
          style="width: 90%; margin: auto">
          <div style="width: 50%; margin: auto; display: flex; align-items: center; justify-content: space-evenly">
            <span
              style="cursor: pointer; margin: .5%;"
              class="tag is-medium is-link"
              >where
            </span>
            <button
              style="display: {expressions.length > 0 ? 'none' : ''}"
              on:click={addNewCondition}
              class="button is-small is-light is-primary"><i class="fa fa-plus" /></button>
          </div>
          {#each expressions as expression, index}
            <div style="display: block; width: 100%">
              <div style="display: flex; align-items: center">
                {#each Object.keys(expression) as oper}
                  <span
                    class="tag is-medium is-warning"
                    style="margin: .5%;">
                    {expression[`${oper}`]}
                  </span>
                {/each}
                <button
                  on:click={() => removeConditionAtIndex(index)}
                  class="button is-small is-light is-danger"><i class="fa fa-x" /></button>
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
              falseStatement.underEdit = !trueStatement.underEdit
            }}
            on:keydown={handleEnterKey}
            style="cursor:pointer; border: {trueStatement.underEdit ? '2px solid blue' : 'none'}"
            tabindex="0"
            class="tag is-medium is-success">
            {trueStatement.statement.length > 0 ? trueStatement.statement : ''}
            <button
              on:click={() => (trueStatement.statement = '')}
              class="delete is-small" />
          </span>
          <span
            on:click={() => {
              falseStatement.underEdit = !falseStatement.underEdit
              trueStatement.underEdit = !falseStatement.underEdit
            }}
            on:keydown={handleEnterKey}
            style="cursor:pointer; border: {falseStatement.underEdit ? '2px solid blue' : 'none'}"
            class="tag is-medium is-danger"
            tabindex="0"
            >{falseStatement.statement.length > 0 ? falseStatement.statement : ''}
            <button
              on:click={() => (falseStatement.statement = '')}
              class="delete is-small" />
          </span>
        </div>
      {/if}
    </div>
    <!--    <div class="column">-->
    <div
      class="expression-builder-button icon"
      on:click={() => {
        showExpressionBuilder = !showExpressionBuilder
      }}
      on:keydown={handleEnterKey}
      data-testid="expression-builder-button"
      use:popperRef>
      <Fa
        icon={faCalculator}
        style="font-size: 16px; color: white" />
    </div>

    {#if showExpressionBuilder}
      <div
        id="tooltip"
        data-testid="tooltip"
        use:popperContent={popperOptions}
        transition:fade>
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
  <div
    class="columns"
    style="width: fit-content">
    <div
      class="column"
      style="width: 100%; justify-content: space-between; margin-left: auto">
      <button
        style="display: {simpleExpressionAvailable ? 'none' : ''}"
        class="button other-button is-small"
        on:click={() => (combiningOperators = [...combiningOperators, '&'])}>
        AND
      </button>
      <button
        style="display: {simpleExpressionAvailable ? 'none' : ''}"
        class="button other-button is-small"
        on:click={() => (combiningOperators = [...combiningOperators, '|'])}>
        OR
      </button>
      <button
        style="display: {simpleExpressionAvailable ? 'none' : ''}"
        class="button other-button is-small"
        on:click={() => (combiningOperators = [...combiningOperators, '~'])}>
        NOT
      </button>
      <button
        class="button primary-button is-small"
        on:click={applyExpression}
        alt="Apply expression"
        title="Apply expression">
        Apply
      </button>
      <button
        class="button secondary-button is-small"
        on:click={clearAppliedExpression}
        alt="Clear expression"
        title="Clear expression">
        Clear
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  @import 'src/styles/popper.scss';
  #tooltip {
    max-height: 300px;
    max-width: 600px;
  }

  .expression-builder-button {
    background: #d12800;
    padding: 10px;
    width: 32px;
    height: 32px;
    border-radius: 5px;
    cursor: pointer;
  }
</style>
