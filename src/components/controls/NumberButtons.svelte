<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  const numbers = {
    title: 'Numbers',
    operators: ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '(', ')', '.'],
  }

  const handleValuesClick = (val) => {
    dispatch('valueclicked', {
      number: val,
    })
  }
</script>

<div class="column">
  <div class="numbers">
    <div class="buttons">
      {#each numbers.operators as number}
        <button class="button is-small" on:click={() => handleValuesClick(number)} alt={number} title={number}>
          <span>{number}</span>
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
