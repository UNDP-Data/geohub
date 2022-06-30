<script lang="ts">
  import PropertySelect from './vector-styles/PropertySelect.svelte'
  import { map } from '$stores'
  import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons/faDeleteLeft'
  import NumberButtons from '../NumberButtons.svelte'
  import VectorFilterOperators from './vector-styles/VectorFilterOperators.svelte'

  import Fa from 'svelte-fa'
  import FilterExpression from '../FilterExpression.svelte'

  export let isFilterPanelVisible = false
  export let layer

  // vars
  let propertySelectValue: string = null

  let expression = ''
  let expList: any = [1, 2, 3]
  let showTooltip = false

  const propertySelected = (e) => {
    propertySelectValue = e.detail.prop
    expList.splice(2, propertySelectValue)
    expression = expression.concat(propertySelectValue)
  }

  const handleNumberClick = (e) => {
    expression = expression.concat(e.detail.value)
  }

  const handleOperatorSelected = (e) => {
    expression = expression.concat(e.detail.operator)
  }
</script>

{#if isFilterPanelVisible === true}
  <div>
    <div class="columns" style="align-items: center">
      <PropertySelect {layer} on:select={propertySelected} />
    </div>
    <div class="columns" style="display: flex; align-items: center; justify-content: space-evenly; margin-top: 5px">
      <VectorFilterOperators on:operatorselected={handleOperatorSelected} />
      <NumberButtons on:valueclicked={handleNumberClick} />
    </div>
    <FilterExpression {layer} bind:expression />
  </div>
{/if}

<style lang="scss">
  #tooltip {
  }
</style>
