<script lang="ts">
  import { map } from '$stores'
  import Fa from 'svelte-fa'
  import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons/faDeleteLeft'
  import { groupByN } from '$lib/helper'

  export let layer
  export let expression = ''

  let warnWrongExpression: boolean

  const handleClearExpression = () => {
    expression = ''
    warnWrongExpression = false
    $map.setFilter(layer.definition.id, null)
  }

  const handleDeleteValue = () => {
    expression = expression.slice(0, expression.length - 1)
  }

  const handleApplyExpression = () => {
    const complexExpression = /^[(any)|(all)|(none)]+,([\w]+,(?:<=|<|>=|>|!=|==)+,[+-]?([0-9]*[.])?[0-9]+,)+$/
    const re = /^[\w]+,[(==)|(!=)|(<)|(>)|(<=)|(>=)]+,[+-]?([0-9]*[.])?[0-9]+$/

    if (re.exec(expression)) {
      console.log('Simple Expression Passed')
      warnWrongExpression = false
      const expList = expression.split(',')
      if (isNaN(Number(expList[2]))) {
        // The value cannot be converted to a number
        $map.setFilter(layer.definition.id, [expList[1], ['get', expList[0]], expList[2]])
      } else {
        $map.setFilter(layer.definition.id, [expList[1], ['get', expList[0]], Number(expList[2])])
      }
    } else if (complexExpression.exec(expression.concat(','))) {
      warnWrongExpression = false
      console.log('Complex Expression Passed')
      const expList = expression.split(',')
      const combineOperator = expList[0]
      const groupedExpressions = groupByN(3, expList.slice(1))

      // generate a filter expression that has all the expressions
      const filtersList = []
      groupedExpressions.map((item) => {
        filtersList.push([item[1], ['get', item[0]], Number(item[2])])
      })
      console.log(...filtersList)
      $map.setFilter(layer.definition.id, [combineOperator, ...filtersList])
    } else {
      warnWrongExpression = true
    }
  }
</script>

<div class="expression">
  <div class="is-size-7 has-text-weight-semibold">Filter expression: property, operation, value</div>
  <div class="columns">
    <div class="column is-7" style="display: flex; align-items: center">
      <div class="control has-icons-right">
        <input
          style={warnWrongExpression ? 'border:1px solid red' : 'border:1px solid grey'}
          placeholder="Property, Operation, Value"
          class="input is-small is-rounded"
          bind:value={expression}
          type="text"
          maxlength="100"
          alt="Expression input"
          title="Expression input" />
        {#if warnWrongExpression}
          <span class="icon is-small is-right">
            <i style="color:red;" class="fas fa-x fa-xs" />
          </span>
        {/if}
      </div>
    </div>
    <div class="column">
      <button class="button is-small" on:click={handleDeleteValue} alt="Delete" title="Delete">
        <span><Fa icon={faDeleteLeft} /></span>
      </button>
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

<style lang="scss">
</style>
