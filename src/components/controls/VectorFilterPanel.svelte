<script lang="ts">
  import PropertySelect from '$components/controls/vector-styles/PropertySelect.svelte'
  import VectorFilterExpressionCreator from '$components/controls/vector-styles/VectorFilterExpressionCreator.svelte'
  import { map } from '$stores'

  export let isFilterPanelVisible = false
  export let layer

  // vars
  let expression = ''
  let alteringIndex = 0
  let expressionsArray = [{}]
  let numbers = ''
  let selectedCombiningOperator = 'all'

  const layerId = layer.definition.id
  const combiningOperators = [
    { title: 'AND', operation: 'all' },
    { title: 'OR', operation: 'any' },
    { title: 'NOR', operation: 'none' },
  ]

  const propertySelected = (e) => {
    expressionsArray[alteringIndex]['property'] = e.detail.prop
  }

  const operatorSelected = (e) => {
    expressionsArray[alteringIndex]['operator'] = e.detail.operator
  }

  $: alteringIndex, (numbers = '')

  const numberSelected = (e) => {
    numbers = numbers.concat(e.detail.number)
    expressionsArray[alteringIndex]['value'] = numbers
  }

  const handleApplyExpression = () => {
    if (expressionsArray.length === 1) {
      //Simple Expression
      $map.setFilter(layerId, [
        expressionsArray[0].operator,
        ['get', expressionsArray[0].property],
        Number(expressionsArray[0].value),
      ])
    } else if (expressionsArray.length > 1) {
      // complex expression
      const properties = expressionsArray.map((expression) => {
        return expression.property
      })
      const operators = expressionsArray.map((expression) => {
        return expression.operator
      })
      const values = expressionsArray.map((expression) => {
        return expression.value
      })
      const expressions = []
      for (let i = 0; i < expressionsArray.length; i++) {
        expressions.push([operators[i], ['get', properties[i]], Number(values[i])])
      }
      console.log(expressions)
      $map.setFilter(layerId, [selectedCombiningOperator, ...expressions])
    } else {
      // No expression
    }
  }

  const removeOperation = (key, index) => {
    delete expressionsArray[index][key]
    expressionsArray = [...expressionsArray.splice(index, 1, expressionsArray[index][key])]
  }

  const handleClearExpression = () => {
    $map.setFilter(layerId, null)
    alteringIndex = 0
    expressionsArray = [{}]
    expressionsArray.splice(alteringIndex, 1, {})
    numbers = ''
  }

  const addExpression = () => {
    alteringIndex = expressionsArray.length
    expressionsArray = [...expressionsArray, { property: '', operator: '', value: '' }]
  }

  const removeLastExpression = () => {
    expressionsArray = [...expressionsArray.splice(alteringIndex, 1)]
    alteringIndex = alteringIndex - 1
  }
</script>

{#if isFilterPanelVisible === true}
  <div style="display: block;">
    <div class="columns" style="align-items: center">
      <PropertySelect {layer} on:select={propertySelected} />
      <VectorFilterExpressionCreator
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
                <div style="margin: 2px">
                  <span class="tag is-info is-medium"
                    >{expression[key] !== '' ? expression[key] : ''}
                    <button on:click={() => removeOperation(key, index)} class="delete is-small" />
                  </span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <div style="display: flex; align-items: center; justify-content: space-around; margin-top: 10%">
        {#if expressionsArray.length > 1}
          <button
            class="button is-light is-small is-vcentered"
            on:click={removeLastExpression}
            alt="Remove expression button"
            title="Remove Last Expression"><i class="fas fa-minus" /></button>
        {/if}
        <button
          class="button is-light is-small is-vcentered"
          on:click={addExpression}
          alt="Add expression button"
          title="Add expression button"><i class="fas fa-plus" /></button>
        {#if expressionsArray.length > 1}
          <div class="select is-rounded is-flex is-justify-content-left">
            <select bind:value={selectedCombiningOperator} class="is-small" style="border: none">
              {#each combiningOperators as operator}
                <option value={operator.operation}>{operator.title}</option>
              {/each}
            </select>
          </div>
        {/if}

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
    {/if}
  </div>
{/if}

<style lang="scss">
  #expression-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    width: max-content;
    justify-content: space-around;
    max-width: 300px;
  }
</style>
