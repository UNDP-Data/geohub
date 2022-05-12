<script lang="ts">
  import { updateParamsInURL } from '$lib/helper'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer

  let expression = layer.expression

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
    operators: ['where(cond, true, false)', 'sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs'],
  }

  const handleClearExpression = () => {
    expression = ''
    handleApplyExpression()
  }

  const handleAddOperator = (val: string) => {
    expression = expression.concat(val)
  }

  const handleApplyExpression = () => {
    const layerSrc = $map.getSource(layer.definition.source)
    const layerURL = new URL(layerSrc.tiles[0])
    let updatedParams = {}

    if (expression && expression.length > 0) {
      layer.expression = expression
      updatedParams = Object.assign({ expression: layer.expression })
    }

    layerURL.searchParams.delete('expression')
    updateParamsInURL(layer.definition, layerURL, updatedParams)
  }
</script>

<div class="refine-view-container" data-testid="refine-view-container">
  <div class="columns">
    <div class="column">
      <div class="numbers">
        <div class="is-size-7 has-text-weight-semibold">{numbers.title}</div>
        <div class="buttons">
          {#each numbers.operators as operator}
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
      <div class="functions">
        <div class="is-size-7 has-text-weight-semibold">{functionsList.title}</div>
        <div class="buttons">
          {#each functionsList.operators as operator}
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
        <div class="buttons">
          {#each arithmetic.operators as operator}
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
    </div>
  </div>
  <div class="expression">
    <div class="is-size-7 has-text-weight-semibold">Expression</div>
    <div class="columns">
      <div class="column is-7">
        <input
          class="input is-small is-rounded"
          bind:value={expression}
          type="text"
          maxlength="100"
          alt="Expression input"
          title="Expression input" />
      </div>
      <div class="column">
        <button
          class="button is-info is-light is-small"
          on:click={handleApplyExpression}
          alt="Apply expression button"
          title="Apply expression button">Apply</button>
        <button
          class="button is-vcentered is-small"
          on:click={handleClearExpression}
          data-testid="filter-clear-button"
          alt="Clear expression button"
          title="Clear expression button">
          <span class="icon">
            <i class="fas fa-xmark" />
          </span>
        </button>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .refine-view-container {
    padding-left: 10px;

    > div {
      margin-bottom: 15px;
    }

    .comparison,
    .arithmetic,
    .numbers {
      max-width: 130px;
      width: 150px;
    }

    .functions {
      button {
        min-width: 40px;
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
    .comparison,
    .arithmetic {
      > div {
        margin-bottom: 5px;
      }
    }
  }
</style>
