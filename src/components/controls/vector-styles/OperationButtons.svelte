<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let currentSelectedOperation = ''
  export let stringProperty = false
  export let numberProperty = false
  export let disableNonNumericOperators = false

  const operationOptions = [
    { value: '==', label: 'Equal To', disabled: false },
    { value: '!=', label: 'Not Equal To', disabled: false },
    { value: '<', label: 'Less Than', disabled: stringProperty }, // < disabled when property is string
    { value: '>', label: 'Greater Than', disabled: stringProperty }, // < disabled when property is string
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

<div class="grid" role="menu">
  {#each operationOptions as operation}
    <div
      class="card grid-item p-0 m-0 is-clickable {operation.disabled ? 'disabled' : null} {operation.value ===
      currentSelectedOperation
        ? 'has-background-success '
        : 'has-background-white-ter'}"
      on:click={() => {
        operation.disabled ? null : (currentSelectedOperation = operation.value)
        operation.disabled ? null : dispatch('click')
      }}>
      <div class="card-header is-size-6 is-shadowless">
        <span class="card-header-title is-centered is-v-centered p-1 m-1 has-text-info-dark  ">
          {operation.label}
        </span>
        {#if operation.value === currentSelectedOperation}
          <span class="icon  ">
            <i class="fa-solid fa-check has-text-black" />
          </span>
        {/if}
      </div>
      <div class="content  has-text-danger-dark ">
        <span class="is-size-7 is-centered" />
      </div>
    </div>
    <!-- <div
      disabled='{operation.disabled}'
      class="card grid-item vector-expression-card {operation.disabled ? 'disabled':null} {operation.value === currentSelectedOperation ? 'clicked' : null}"
      on:click={() => {
        operation.disabled ? null : (currentSelectedOperation = operation.value)
        operation.disabled ? null : (dispatch('click'))
      }}>
      <div class="vector-expression-card-content">
        <span class="text-centered">{operation.label}</span>
      </div>
    </div> -->
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
