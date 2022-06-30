<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import Popper from '../../../lib/popper'
  import { fade } from 'svelte/transition'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Card, { PrimaryAction } from '@smui/card'

  let showTooltip = false
  let selectedOperators
  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'left',
      strategy: 'fixed',
    },
    [0, 0],
  ).init()

  const dispatch = createEventDispatcher()

  const operators = {
    title: 'Operators',
    operators: ['==', '!=', '>', '>=', '<', '<=', 'in', '!in', ','],
  }

  const handleOperatorClick = (op) => {
    dispatch('operatorselected', {
      operator: op,
    })
  }
</script>

<div
  on:click={() => {
    showTooltip = !showTooltip
    selectedOperators = 'Vectors'
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
  <div style="z-index:1000" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
    <div class="card column operators-card" style="width: 50%; border: 1px solid #aaaaaa">
      <div class="columns">
        <div style="width: 80%" class="column" />
        <div style="width: 20%; padding: 0" class="column">
          <button
            id="close"
            on:click={() => (showTooltip = false)}
            style="margin-left: 65%; border:1px solid red"
            class="button is-small">
            <span id="close-x" style="color: red;">X</span>
          </button>
        </div>
      </div>
      <div id="arrow" data-popper-arrow />

      <div>
        <div class="setmembership">
          <div class="buttons" style="display: flex; ">
            {#each operators.operators as operator}
              <button
                class="button is-small"
                on:click={() => handleOperatorClick(operator)}
                alt={operator}
                title={operator}>
                <span>{operator}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  #close:hover {
    background: maroon;
    border: 2px solid grey;
  }
  #close-x:hover {
    color: green;
  }
</style>
