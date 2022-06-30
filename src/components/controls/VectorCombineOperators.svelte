<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  const operators = {
    title: 'Operators',
    operators: ['any', 'all', 'none'],
  }

  const handleOperatorClick = (op) => {
    dispatch('operatorselected', {
      operator: op,
    })
  }
</script>

<div class=" column " style="width: 30%;">
  <div style="border-bottom: 1px solid grey">Combining</div>

  <div class="setmembership" b style="margin-top: 5%">
    <div class="buttons" style="display: flex; ">
      {#each operators.operators as operator}
        <button class="button is-small" on:click={() => handleOperatorClick(operator)} alt={operator} title={operator}>
          <span>{operator}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  #close:hover {
    background: maroon;
    border: 2px solid grey;
  }
  #close-x:hover {
    color: green;
  }
</style>
