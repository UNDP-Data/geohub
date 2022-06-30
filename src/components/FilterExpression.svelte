<script lang="ts">
  import { map } from '../stores'
  import Fa from 'svelte-fa'
  import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons/faDeleteLeft'

  export let layer

  export let expression = ''

  const handleClearExpression = () => {
    expression = ''
    $map.setFilter(layer.definition.id, null)
  }

  const handleDeleteValue = () => {
    expression = expression.slice(0, expression.length - 1)
  }

  const handleApplyExpression = () => {
    const re = /[a-zA-Z0-9]+,(?:<=|<|>=|>|!=|==|has|!has),[0-9]+/
    if (re.test(expression)) {
      const expList = expression.split(',')
      console.log(expList)
      if (isNaN(Number(expList[2]))) {
        // The value cannot be converted to a number
        $map.setFilter(layer.definition.id, [expList[1], ['get', expList[0]], expList[2]])
      } else {
        $map.setFilter(layer.definition.id, [expList[1], ['get', expList[0]], Number(expList[2])])
      }
    } else {
      // Todo: Warn the user of an invalid expression!!
      console.log('REGEX Failed')
    }
  }
</script>

<div class="expression">
  <div class="is-size-7 has-text-weight-semibold">Filter expression</div>
  <div class="columns">
    <div class="column is-7">
      <input
        placeholder="Property, Operation, Value"
        class="input is-small is-rounded"
        bind:value={expression}
        type="text"
        maxlength="100"
        alt="Expression input"
        title="Expression input" />
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
