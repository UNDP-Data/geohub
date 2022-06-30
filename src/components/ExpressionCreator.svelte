<script lang="ts">
  import NumberButtons from './NumberButtons.svelte'
  import VectorFilterOperators from './controls/vector-styles/VectorFilterOperators.svelte'
  import VectorCombineOperators from './controls/VectorCombineOperators.svelte'
  import Popper from '../lib/popper'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Card, { PrimaryAction } from '@smui/card'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import Fa from 'svelte-fa'
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'

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

  const operatorSelected = (e) => {
    expression = expression.concat(e.detail.operator)
    dispatch('input', {
      text: e,
    })
  }
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
  <div style="z-index: 999;" id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
    <div class="card" style="width: 400px">
      <div class="card-content">
        <div class="content">
          <div class="columns" style="justify-content: space-between">
            <NumberButtons on:valueclicked={operatorSelected} />
            <VectorFilterOperators on:operatorselected={operatorSelected} />
            <VectorCombineOperators on:operatorselected={operatorSelected} />
          </div>
        </div>
      </div>
    </div>
    <div id="arrow" data-popper-arrow />
  </div>
{/if}

<style lang="scss">
</style>
