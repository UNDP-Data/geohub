<script lang="ts">
  import NumberButtons from '../NumberButtons.svelte'
  import VectorFilterOperators from './VectorFilterOperators.svelte'
  import VectorCombineOperators from './VectorCombineOperators.svelte'
  import Popper from '$lib/popper'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Card, { PrimaryAction } from '@smui/card'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import Fa from 'svelte-fa'
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import { clickOutside } from 'svelte-use-click-outside'

  export let expression

  const dispatch = createEventDispatcher()

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-end',
      strategy: 'fixed',
    },
    [0, 0],
  ).init()

  let showTooltip: boolean
  let activeOperatorsTab = 'Numbers'

  const operatorSelected = (e) => {
    expression = expression.concat(e.detail.operator)
    dispatch('input', {
      text: e,
    })
  }

  const handleSetOperatorType = (type) => {
    activeOperatorsTab = type
  }
  const operatorTypes = ['Numbers', 'Comparison', 'Combining']
</script>

<div
  on:click={() => {
    showTooltip = !showTooltip
  }}
  data-testid="rexpr-logical"
  use:popperRef>
  <Wrapper>
    <Card>
      <PrimaryAction style="padding: 10px;">
        <Fa icon={faCalculator} style="font-size: 16px;" />
      </PrimaryAction>
    </Card>
    <Tooltip showDelay={100} hideDelay={0} yPos="above">Operators</Tooltip>
  </Wrapper>
</div>
{#if showTooltip}
  <div
    style="z-index: 999;"
    id="tooltip"
    data-testid="tooltip"
    use:popperContent={popperOptions}
    use:clickOutside={() => (showTooltip = false)}
    transition:fade>
    <div class="card" style="width: 300px">
      <div class="card-content" style="padding: 0">
        <div class="tabs" style="margin:0">
          <ul>
            {#each operatorTypes as type}
              <li class={activeOperatorsTab === type ? 'is-active' : ''}>
                <a on:click={() => handleSetOperatorType(type)}>{type}</a>
              </li>
            {/each}
          </ul>
          <button
            on:click={() => (showTooltip = false)}
            id="close"
            style="border:1px solid red"
            class="button is-small">
            <span id="closex" style="color: red">X</span>
          </button>
        </div>

        <div class="content">
          {#if activeOperatorsTab === 'Numbers'}
            <NumberButtons on:valueclicked={operatorSelected} />
          {:else if activeOperatorsTab === 'Comparison'}
            <VectorFilterOperators on:operatorselected={operatorSelected} />
          {:else}
            <VectorCombineOperators on:operatorselected={operatorSelected} />
          {/if}
        </div>
      </div>
    </div>
    <div id="arrow" data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  #close:hover {
    background: maroon;
  }
  #closex:hover {
    color: white;
  }
</style>
