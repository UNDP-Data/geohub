<script lang="ts">
  import PropertySelect from './vector-styles/PropertySelect.svelte'
  import VectorFilterExpression from './vector-styles/VectorFilterExpression.svelte'
  import VectorFilterExpressionCreator from './vector-styles/VectorFilterExpressionCreator.svelte'

  export let isFilterPanelVisible = false
  export let layer

  // vars
  let propertySelectValue: string = null

  let expression = ''

  const propertySelected = (e) => {
    propertySelectValue = e.detail.prop
    expression = expression.concat(propertySelectValue)
  }
</script>

{#if isFilterPanelVisible === true}
  <div>
    <div class="columns" style="align-items: center">
      <PropertySelect {layer} on:select={propertySelected} />
      <VectorFilterExpressionCreator bind:expression />
    </div>
    <VectorFilterExpression {layer} bind:expression />
  </div>
{/if}

<style lang="scss">
</style>
