<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faCircleMinus } from '@fortawesome/free-solid-svg-icons/faCircleMinus'
  import { faCirclePlus } from '@fortawesome/free-solid-svg-icons/faCirclePlus'
  import BigNumber from 'bignumber.js'

  const dispatch = createEventDispatcher()

  export let value = 0
  export let minValue = 0
  export let maxValue = 99
  export let step = 1

  const handleIncrementDecrementClasses = (operation: string) => {
    if (operation === '+' && value < maxValue) {
      value = new BigNumber(value).plus(step).toNumber()
    }
    if (operation === '-' && value > minValue) {
      value = new BigNumber(value).minus(step).toNumber()
    }
    dispatch('change', { value })
  }
</script>

<div class="container is-flex is-justify-content-center" data-testid="number-input-view-container">
  <div class="row">
    <div
      class={`minus ${value === minValue ? 'disabled' : ''}`}
      on:click={() => handleIncrementDecrementClasses('-')}
      alt="Decrease number"
      title="Decrease number">
      <Fa icon={faCircleMinus} />
    </div>
    <div class="tag is-info is-light is-medium" alt="Number Label" title="Number Label">
      {value}
    </div>
    <div
      class={`plus ${value === maxValue ? 'disabled' : ''}`}
      on:click={() => handleIncrementDecrementClasses('+')}
      alt="Increase number"
      title="Increase number">
      <Fa icon={faCirclePlus} />
    </div>
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    height: 40px;
    justify-content: center;

    .row {
      display: flex;
      align-items: center;

      .minus,
      .plus {
        cursor: pointer;
      }

      .disabled {
        cursor: default;
        opacity: 0.1;
      }

      .tag {
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-user-select: none;
        margin-left: 10px;
        margin-right: 10px;
        user-select: none;
        width: 40px;
      }
    }
  }
</style>
