<script lang="ts">
  import NumberButtons from '$components/controls/NumberButtons.svelte'
  import VectorFilterOperators from '$components/controls/vector-styles/VectorFilterOperators.svelte'
  import Popper from '$lib/popper'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Card, { PrimaryAction } from '@smui/card'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import Fa from 'svelte-fa'
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import { clickOutside } from 'svelte-use-click-outside'
  import { faEquals } from '@fortawesome/free-solid-svg-icons/faEquals'
  import { faArrowDown19 } from '@fortawesome/free-solid-svg-icons/faArrowDown19'

  export let propertyStats: number[]
  let showTooltip: boolean
  let activeOperatorsTab = 'Numbers'

  const dispatch = createEventDispatcher()
  const operatorTypes = [
    {
      name: 'numbers',
      title: 'Numbers',
      icon: faArrowDown19,
      operators: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')'],
      isVisible: false,
    },
    {
      name: 'comparison',
      title: 'Comparison',
      icon: faEquals,
      operators: ['=', '!=', '>=', '<', '>', '<='],
      isVisible: false,
    },
  ]

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

  const operatorSelected = (e) => {
    dispatch('operatorselected', {
      operator: e.detail.operator,
    })
  }

  const numberSelected = (e) => {
    dispatch('numberselected', {
      number: e.detail.number,
    })
  }

  const handleSetOperatorType = (type) => {
    activeOperatorsTab = type
  }
</script>

<div
  on:click={() => {
    showTooltip = !showTooltip
  }}
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
        <div class="tabs is-centered" style="margin:0">
          <ul>
            {#each operatorTypes as type}
              <li class={activeOperatorsTab === type.title ? 'is-active' : ''}>
                <a on:click={() => handleSetOperatorType(type.title)}>
                  <Fa icon={type.icon} />
                </a>
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

        <div class="content" style="display: flex; align-items: center; justify-content: space-between">
          <div class="stats message is-info is-normal has-background-white mt-5 is-size-8 has-text-weight-semibold">
            <div id="stats-title" class="stats-content message-header">Statistics</div>
            <div class="stats-content">Min:</div>
            <div class="stats-content">{propertyStats[0]}</div>
            <div class="stats-content">Max:</div>
            <div class="stats-content">{propertyStats[1]}</div>
          </div>
          {#if activeOperatorsTab === 'Numbers'}
            <NumberButtons on:valueclicked={numberSelected} />
          {:else}
            <VectorFilterOperators on:operatorselected={operatorSelected} />
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
