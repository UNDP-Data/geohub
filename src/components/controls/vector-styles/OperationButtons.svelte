<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let currentSelectedOperation = ''

  const operationOptions = [
    { value: '==', label: 'Equal To' },
    { value: '!=', label: 'Not Equal To' },
    { value: '<', label: 'Less Than' },
    { value: '>', label: 'Greater Than' },
    { value: 'has', label: 'Contains' },
    { value: '!has', label: 'Excludes' },
  ]

  const dispatch = createEventDispatcher()

  $: currentSelectedOperation, handleOperationChange()
  const handleOperationChange = () => {
    dispatch('change', {
      operation: currentSelectedOperation,
    })
    dispatch('click')
  }
</script>

<div class="grid" role="menu">
  {#each operationOptions as operation}
    <div
      class="card grid-item vector-expression-card {operation.value === currentSelectedOperation ? 'clicked' : null}"
      on:click={() => {
        currentSelectedOperation = operation.value
      }}>
      <div class="vector-expression-card-content">
        <span class="text-centered">{operation.label}</span>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 2px;
    padding: 2px;
  }
  :global(.vector-expression-card) {
    padding: 0;
    width: 100%;
    height: 50px;
  }
  .vector-expression-card:hover {
    background-color: rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  :global(.text-centered) {
    font-size: 10px;
    text-align: center;
    vertical-align: middle;
    word-break: break-word;
    width: 90%;
    height: fit-content;
  }
  .clicked {
    background-color: rgba(0, 0, 0, 0.2);
    border: 2px solid #000;
  }
</style>
