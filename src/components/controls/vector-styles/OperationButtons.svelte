<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { each } from 'svelte/internal'

  export let currentSelectedOperation = ''
  export let stringProperty = false
  export let numberProperty = false
  export let disableNonNumericOperators = false

  const operationOptions = [
    { value: '==', label: 'Equals', disabled: false },
    { value: '!=', label: 'Differs', disabled: false },
    { value: '<', label: 'Larger', disabled: stringProperty }, // < disabled when property is string
    { value: '>', label: 'Smaller', disabled: stringProperty }, // < disabled when property is string
    { value: 'in', label: 'Contains', disabled: numberProperty },
    { value: '!in', label: 'Excludes', disabled: numberProperty },
  ]

  const dispatch = createEventDispatcher()

  $: currentSelectedOperation, handleOperationChange()
  const handleOperationChange = () => {
    if (currentSelectedOperation === '==' || currentSelectedOperation === '!=') {
      dispatch('disableTags')
    } else {
      dispatch('enableTags')
    }
    dispatch('change', {
      operation: currentSelectedOperation,
    })
  }
</script>

<!-- <div class="columns p-3 is-multiline">
  {#each operationOptions as operation}
    <div class="column m-0 p-0  {operation.disabled ? 'disabled' : null} {operation.value ===
      currentSelectedOperation
        ? 'has-background-success'
        : 'has-background-info-light'}"
      on:click={() => {
        operation.disabled ? null : (currentSelectedOperation = operation.value)
        operation.disabled ? null : dispatch('click')
      }}>
      <div class="box {operation.value ===
        currentSelectedOperation
          ? 'has-background-success'
          : 'has-background-info-light'} has-text-centered is-clickable">
        {operation.label}
      </div>
      

    </div>
  {/each}
</div> -->
<div class="grid" role="menu">
  {#each operationOptions as operation}
    <div
      class="card grid-item p-0 m-0 is-clickable {operation.disabled ? 'disabled' : null} "
      on:click={() => {
        operation.disabled ? null : (currentSelectedOperation = operation.value)
        operation.disabled ? null : dispatch('click')
      }}>
      <div
        class="card-header is-size-6  pb-3 pt-3 m-0 {currentSelectedOperation === operation.value
          ? 'has-background-success'
          : 'has-background-info-light'} ">
        <span
          class="card-header-title is-centered is-v-centered {currentSelectedOperation === operation.value
            ? 'has-text-success-darker'
            : 'has-text-info-darker'}  ">
          {operation.label}
          {#if currentSelectedOperation === operation.value}
            <span class="icon  ">
              <i class="fa-solid fa-check has-text-black" />
            </span>
          {/if}
        </span>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 5px;
    padding: 0px;
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
    font-weight: bolder;
    text-align: center;
    vertical-align: middle;
    word-break: break-word;
    text-overflow: ellipsis;
    width: 100%;
    height: fit-content;
  }
  .clicked {
    background-color: rgba(0, 0, 0, 0.2);
    border: 2px solid #000;
  }
  .disabled {
    opacity: 0.5;
    background-color: white !important;
    cursor: not-allowed !important;
  }
</style>
