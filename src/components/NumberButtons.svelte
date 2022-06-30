<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Popper from '../lib/popper'
  import Fa from 'svelte-fa'
  import { faArrowDown19 } from '@fortawesome/free-solid-svg-icons/faArrowDown19'
  import { fade } from 'svelte/transition'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Card, { PrimaryAction } from '@smui/card'

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

  let showTooltip = false
  let selectedOperators
  const dispatch = createEventDispatcher()

  const numbers = {
    title: 'Numbers',
    operators: ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '(', ')'],
  }

  const handleValuesClick = (val) => {
    dispatch('valueclicked', {
      value: val,
    })
  }
</script>

<div
  on:click={() => {
    showTooltip = !showTooltip
    selectedOperators = 'Numbers'
  }}
  data-testid="rexpr-logical"
  use:popperRef>
  <Wrapper>
    <Card>
      <PrimaryAction style="padding: 10px;">
        <Fa icon={faArrowDown19} style="font-size: 16px;" />
      </PrimaryAction>
    </Card>
    <Tooltip showDelay={100} hideDelay={0} yPos="above">Numbers</Tooltip>
  </Wrapper>
</div>
{#if showTooltip && selectedOperators === 'Numbers'}
  <div style="z-index:1000" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
    <div class="card column operators-card" style="width: 30%; border: 1px solid #aaaaaa">
      <div class="columns">
        <div style="width: 80%" class="column" />
        <div style="width: 20%; padding: 0" class="column">
          <button
            on:click={() => (showTooltip = false)}
            id="close"
            style="margin-left: 50%; border:1px solid red"
            class="button is-small">
            <span id="close-x" style="color: red;">X</span>
          </button>
        </div>
      </div>
      <div class="numbers">
        <div class="buttons">
          {#each numbers.operators as operator}
            <button
              class="button is-small"
              on:click={() => handleValuesClick(operator)}
              alt={operator}
              title={operator}>
              <span>{operator}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>
    <div id="arrow" data-popper-arrow />
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
