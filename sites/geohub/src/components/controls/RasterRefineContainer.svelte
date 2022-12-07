<script lang="ts">
  import { DynamicLayerLegendTypes, COLOR_CLASS_COUNT_MAXIMUM } from '$lib/constants'

  import {
    fetchUrl,
    getActiveBandIndex,
    getLayerStyle,
    getValueFromRasterTileUrl,
    updateParamsInURL,
  } from '$lib/helper'
  import type { Layer, RasterLayerStats, RasterTileMetadata } from '$lib/types'
  import { map, layerList } from '$stores'
  import type { RasterTileSource } from 'maplibre-gl'

  export let layer: Layer
  export let legendType: DynamicLayerLegendTypes
  let info: RasterTileMetadata
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ;({ info } = layer)

  let expression = getValueFromRasterTileUrl($map, layer.id, 'expression') as string
  const bandIndex = getActiveBandIndex(info)
  const band = `b${bandIndex + 1}`

  const arithmetic = {
    title: 'Arithmetic',
    operators: ['*', '/', '+', '-', '%', '**'],
  }

  const comparison = {
    title: 'Comparison',
    operators: ['=', '!=', '>=', '<', '>', '<='],
  }

  const logical = {
    title: 'Logical',
    operators: ['&', '~', '|'],
  }

  const numbers = {
    title: 'Numbers',
    operators: ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '(', ')'],
  }

  const functionsList = {
    title: 'Functions',
    operators: ['sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs'],
  }

  const handleFunctions = (func: string) => {
    expression = expression.concat(`${func}()`)
  }

  const handleRemoveExpression = async () => {
    const layerStyle = getLayerStyle($map, layer.id)
    const layerSrc: RasterTileSource = $map.getSource(layerStyle.source) as RasterTileSource
    const layerURL = new URL(layerSrc.tiles[0])
    expression = ''
    //handleApplyExpression()
    if (layerURL.searchParams.has('expression')) {
      let updatedParams = {}
      const statsUrl = new URL(
        `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${getValueFromRasterTileUrl($map, layer.id, 'url')}`,
      )
      info.stats = await fetchUrl(statsUrl.toString())
      const band = info.active_band_no
      const bandName = Object.keys(layer.info.stats)

      //overwrite CL logic
      updatedParams['rescale'] = [info.stats[band].min, info.stats[band].max]

      layerURL.searchParams.delete('expression')
      if (Number(info.stats[bandName].unique) > COLOR_CLASS_COUNT_MAXIMUM) {
        layerURL.searchParams.delete('colormap')
        const colorMapName = getValueFromRasterTileUrl($map, layer.id, 'colormap_name') as string
        layerURL.searchParams.set('colormap_name', colorMapName)
        legendType = DynamicLayerLegendTypes.CONTINUOUS
      }

      updateParamsInURL(layerStyle, layerURL, updatedParams)
    }
    const nlayer = { ...layer, info: info }
    const layers = $layerList.map((lyr) => {
      return layer.id !== lyr.id ? lyr : nlayer
    })
    layerList.set([...layers])
  }
  const handleClearExpression = () => {
    expression = ''
    console.clear()
  }

  const handleWhere = () => {
    expression = `where(${band},true, false)`
  }
  const handleNumber = (num: string) => {
    expression = expression.concat(num)
  }
  const handleAddOperator = (val: string) => {
    expression = expression.concat(val)
  }

  const handleApplyExpression = async () => {
    if (expression && expression.length > 0) {
      const layerStyle = getLayerStyle($map, layer.id)
      const layerSrc: RasterTileSource = $map.getSource(layerStyle.source) as RasterTileSource
      const layerURL = new URL(layerSrc.tiles[0])
      let updatedParams = {}
      const exprStatUrl = new URL(
        `${layerURL.protocol}//${layerURL.host}/cog/statistics?url=${getValueFromRasterTileUrl(
          $map,
          layer.id,
          'url',
        )}&expression=${encodeURIComponent(expression)}`,
      )
      console.log(exprStatUrl.searchParams.get('expression').includes('where'))
      if (exprStatUrl.searchParams.get('expression').includes('where')) {
        exprStatUrl.searchParams.append('categorical', 'true')
      }
      const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
      info.stats = exprStats
      const band = Object.keys(exprStats)[bandIndex]
      updatedParams = { expression: expression }
      //overwrite CL logic
      updatedParams['rescale'] = [info.stats[band].min, info.stats[band].max]

      layerURL.searchParams.delete('expression')
      updateParamsInURL(layerStyle, layerURL, updatedParams)

      const nlayer = { ...layer, info: info }
      const layers = $layerList.map((lyr) => {
        return layer.id !== lyr.id ? lyr : nlayer
      })
      layerList.set([...layers])
    }
  }
</script>

<div
  class="refine-view-container"
  data-testid="refine-view-container">
  <div class="columns">
    <div class="column">
      <div class="numbers">
        <div class="is-size-7 has-text-weight-semibold">{numbers.title}</div>
        <div class="buttons">
          {#each numbers.operators as operator}
            <button
              class="button is-small "
              on:click={() => handleNumber(operator)}
              alt={operator}
              title={operator}>
              <span>{operator}</span>
            </button>
          {/each}
        </div>
      </div>
      <div class="functions">
        <div class="is-size-7 has-text-weight-semibold">{functionsList.title}</div>
        <div class="buttons">
          {#each functionsList.operators as operator}
            <button
              class="button is-small"
              on:click={() => handleFunctions(operator)}
              alt={operator}
              title={operator}>
              <span>{operator}</span>
            </button>
          {/each}
          <button
            class="button is-small"
            on:click={handleWhere}
            alt="where(cond,true,false)"
            title="where(cond,true,false)">
            <span>where</span>
          </button>
        </div>
      </div>
    </div>
    <div class="column">
      <div class="logical">
        <div class="is-size-7 has-text-weight-semibold">{logical.title}</div>
        <div class="buttons">
          {#each logical.operators as operator}
            <button
              class="button is-small"
              on:click={() => handleAddOperator(operator)}
              alt={operator}
              title={operator}>
              <span>{operator}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="comparison">
        <div class="is-size-7 has-text-weight-semibold">{comparison.title}</div>
        <div class="buttons">
          {#each comparison.operators as operator}
            <button
              class="button is-small"
              on:click={() => handleAddOperator(operator)}
              alt={operator}
              title={operator}>
              <span>{operator}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="arithmetic">
        <div class="is-size-7 has-text-weight-semibold">{arithmetic.title}</div>
        <div class="buttons ">
          {#each arithmetic.operators as operator}
            <button
              class="button is-small"
              on:click={() => handleAddOperator(`${operator}`)}
              alt={operator}
              title={operator}>
              <span>{operator}</span>
            </button>
          {/each}
        </div>
      </div>
      <button
        class="button is-small button-primary"
        on:click={() => handleAddOperator(`${band}`)}
        alt="Current layer"
        title="Current layer. Add">
        <span>Current layer</span>
      </button>
    </div>
  </div>
  <div class="expression">
    <div class="is-size-7 has-text-weight-semibold">Expression</div>
    <div class="columns">
      <div class="column is-12">
        <input
          class="input is-small is-rounded"
          bind:value={expression}
          type="text"
          maxlength="100"
          alt="Expression input"
          title="Expression input" />
      </div>
    </div>
    <div class="columns">
      <div
        class="column"
        style="width: fit-content; margin-left: auto">
        <button
          class="button primary-button is-small"
          on:click={handleApplyExpression}
          alt="Apply expression"
          title="Apply expression">
          Apply
        </button>
        <button
          class="button secondary-button is-small"
          on:click={handleClearExpression}
          alt="Clear expression"
          title="Clear expression">
          Clear
        </button>
        <button
          class="button is-vcentered is-small"
          on:click={handleRemoveExpression}
          data-testid="filter-clear-button"
          alt="Remove expression"
          title="Remove expression">
          <span class="icon">
            <i class="fas fa-xmark" />
          </span>
        </button>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .button-primary {
    background-color: #d12800;
    color: #fff;
    border: 1px solid #d12800;
  }

  .refine-view-container {
    padding-left: 10px;

    > div {
      margin-bottom: 0px;
    }

    .comparison,
    .arithmetic,
    .numbers {
      max-width: 130px;
      width: 150px;
    }

    .functions {
      button {
        width: 30px;
      }
    }

    .numbers,
    .logical,
    .comparison,
    .arithmetic {
      button {
        width: 30px;
      }
    }

    .expression,
    .numbers,
    .logical,
    .existential,
    .functions,
    .arithmetic {
      > div {
        margin-bottom: 5px;
      }
    }
  }
</style>
