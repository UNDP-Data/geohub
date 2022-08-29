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
  import { faEquals } from '@fortawesome/free-solid-svg-icons/faEquals'
  import { faArrowDown19 } from '@fortawesome/free-solid-svg-icons/faArrowDown19'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'

  export let propertyStats: number[]
  let showTooltip: boolean
  let activeOperatorsTab = 'Numbers'

  const dispatch = createEventDispatcher()
  const operatorTypes = [
    {
      title: 'Numbers',
      icon: faArrowDown19,
      isVisible: false,
    },
    {
      title: 'Comparison',
      icon: faEquals,
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
    <Card style="background: #D12800">
      <PrimaryAction style="padding: 10px;">
        <Fa icon={faCalculator} style="font-size: 16px; color:white" />
      </PrimaryAction>
    </Card>
    <Tooltip showDelay={100} hideDelay={0} yPos="above">Operators</Tooltip>
  </Wrapper>
</div>

{#if showTooltip}
  <div
    style="z-index: 999; width: 300px"
    id="tooltip"
    data-testid="tooltip"
    use:popperContent={popperOptions}
    transition:fade>
    <div class="card">
      <div class="card-content" style="padding: 0">
        <div class="tabs is-centered" style="margin:0">
          <ul data-deep-link="true" data-tabs="true" id="tablist_1" role="tablist">
            {#each operatorTypes as type}
              <li class={activeOperatorsTab === type.title ? 'is-active tabs-title' : 'tabs-title'}>
                <a style="border: none;" on:click={() => handleSetOperatorType(type.title)}>
                  <Fa icon={type.icon} style="color: #232E3D" />
                </a>
              </li>
            {/each}
          </ul>
          <div
            style="cursor: pointer"
            class="column is-1 close"
            alt="Close Colormap Picker"
            title="Close Colormap Picker"
            on:click={() => (showTooltip = false)}>
            <Fa icon={faXmark} />
          </div>
        </div>

        <div class="content" style="display: flex; align-items: center; justify-content: space-between">
          <div class="stats message is-info is-normal has-background-white mt-5 is-size-8 has-text-weight-semibold">
            <div id="stats-title" class="stats-content message-header">Statistics</div>
            <div class="stats-content">Min:</div>
            <div class="stats-content">{propertyStats[0] !== undefined ? propertyStats[0] : ''}</div>
            <div class="stats-content">Max:</div>
            <div class="stats-content">{propertyStats[1] !== undefined ? propertyStats[1] : ''}</div>
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
  @import 'src/styles/undp-design/base-minimal.min';
  @import 'src/styles/undp-design/tab.min';
  #close:hover {
    background: maroon;
  }
  #closex:hover {
    color: white;
  }
</style>
