<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let currentSelectedOperation = ''
  export let stringProperty = false
  export let numberProperty = false

  const operationOptions = [
    { value: '==', label: 'Equals', disabled: false, symbol: '=' },
    { value: '!=', label: 'Differs', disabled: false, symbol: '≠' },
    { value: '<', label: 'Larger', disabled: stringProperty, symbol: '>' }, // < disabled when property is string
    { value: '>', label: 'Smaller', disabled: stringProperty, symbol: '<' }, // < disabled when property is string
    { value: 'in', label: 'Contains', disabled: numberProperty, symbol: '⊂' },
    { value: '!in', label: 'Excludes', disabled: numberProperty, symbol: '⊄' },
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

<div class="grid" role="menu">
  {#each operationOptions as operation}
    <div
      class="card grid-item p-0 m-0 is-clickable {operation.disabled ? 'disabled' : null} "
      on:click={() => {
        operation.disabled ? null : (currentSelectedOperation = operation.value)
        operation.disabled ? null : dispatch('click')
      }}>
      <div
        class="card-header is-size-6  pb-0 pt-0 m-0 {currentSelectedOperation === operation.value
          ? 'has-background-success'
          : 'has-background-info-dark'} ">
        <span
          class="card-header-title is-centered is-v-centered {currentSelectedOperation === operation.value
            ? 'has-text-success-darker'
            : 'has-text-white-ter'}  ">
          {operation.label}
          {#if currentSelectedOperation === operation.value}
            <span class="icon  ">
              <i class="fa-solid fa-check has-text-black" />
            </span>
          {/if}
        </span>
      </div>
      <div class="card-content  p-0 m-0 has-text-centered ">
        <div class="content is-size-2  p-0 m-0 has-text-weight-bold has-text-danger">
          {operation.symbol}
        </div>
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

  .disabled {
    opacity: 0.5;
    background-color: white !important;
    cursor: not-allowed !important;
  }
</style>
