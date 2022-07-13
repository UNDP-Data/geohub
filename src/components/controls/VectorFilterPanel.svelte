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
  let selectedCombiningOperator
  let notificationShown = false
  let combiningOperatorTitle

  const layerId = layer.definition.id
  const combiningOperators = [
    { title: 'AND', operation: 'all' },
    { title: 'OR', operation: 'any' },
    { title: 'NOR', operation: 'none' },
  ]

  const propertySelected = (e) => {
    console.log(alteringIndex)
    alteringIndex < 0 ? (alteringIndex = 0) : alteringIndex
    expressionsArray[alteringIndex]['property'] = e.detail.prop
  }

  const operatorSelected = (e) => {
    alteringIndex < 0 ? (alteringIndex = 0) : alteringIndex
    expressionsArray[alteringIndex]['operator'] = e.detail.operator
  }

  $: alteringIndex, (numbers = '')
  $: {
    if (expressionsArray == [{}]) {
      $map.setFilter(layerId, null)
    }
  }

  const numberSelected = (e) => {
    numbers = numbers.concat(e.detail.number)
    expressionsArray[alteringIndex]['value'] = numbers
  }

  const handleApplyExpression = () => {
    if (expressionsArray.length === 1) {
      //Simple Expression
      $map.setFilter(layerId, [
        expressionsArray[0]['operator'],
        ['get', expressionsArray[0]['property']],
        Number(expressionsArray[0]['value']),
      ])
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
      console.log(expressions)
      $map.setFilter(layerId, [selectedCombiningOperator, ...expressions])
    } else {
      // No expression
    }
  }

  const removeOperation = (key, index) => {
    delete expressionsArray[index][String(key)]
    if (key === 'value') {
      numbers = ''
    }
    expressionsArray = [...expressionsArray]
    if (Object.keys(expressionsArray[index]).length < 1) {
      alteringIndex = alteringIndex - 1
    }
  }

  const handleClearExpression = () => {
    $map.setFilter(layerId, null)
    alteringIndex = 0
    expressionsArray = [{}]
    expressionsArray.splice(alteringIndex, 1, {})
    numbers = ''
  }

  const handleOperatorClick = (op) => {
    combiningOperatorTitle = op.title
    selectedCombiningOperator = op.operation
    notificationShown = true
    if (expressionsArray.length === 1) {
      alteringIndex = expressionsArray.length
      expressionsArray = [...expressionsArray, { property: '', operator: '', value: '' }]
    }
  }
  const addExpression = () => {
    alteringIndex = expressionsArray.length
    expressionsArray = [...expressionsArray, { property: '', operator: '', value: '' }]
  }

  const removeThisExpression = (exp) => {
    const index = expressionsArray.indexOf(exp)
    numbers = ''
    expressionsArray.splice(index, 1)
    alteringIndex = alteringIndex - 1
    expressionsArray = expressionsArray.length < 1 ? [...expressionsArray, {}] : [...expressionsArray]
  }

  const editThisExpression = (exp) => {
    alteringIndex = expressionsArray.indexOf(exp)
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
                <div style="margin: 2px; display: flex; align-items: center">
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
              <span>&nbsp;&nbsp;</span>
              <a style="text-decoration: none" on:click={() => removeThisExpression(expression)} class="tag is-small"
                ><i class="fa fa-trash" /></a>
              <span>&nbsp;&nbsp;</span>
              <a
                style="text-decoration: none"
                on:click={() => editThisExpression(expression)}
                class="tag is-small {index === alteringIndex ? 'is-danger' : ''}"><i class="fa fa-pen" /></a>
              {#if index === expressionsArray.length - 1}
                <span>&nbsp;&nbsp;</span>
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
            disabled={(selectedCombiningOperator === operator.operation) | (expressionsArray.length < 1)}
            class="button is-light is-small is-vcentered is-success"
            on:click={() => {
              handleOperatorClick(operator)
            }}
            alt="Combining operator button"
            title="Combining operator button">{operator.title}</button>
        {/each}
        <button
          style="margin:1%"
          class="button is-info is-light is-small"
          on:click={handleApplyExpression}
          alt="Apply expression button"
          title="Apply expression button">Apply</button>
        <button
          style="margin:1%"
          class="button is-light is-light is-small"
          on:click={handleClearExpression}
          alt="Apply expression button"
          title="Apply expression button">Clear</button>
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
