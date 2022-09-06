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
  import type { Layer } from '$lib/types'

  export let propertyStats: number[]
  export let layer: Layer
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

  const handleEnterKey = (e: any) => {
    if (e.key === 'Enter') {
      e.target.click()
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      setLeftActiveTab(activeOperatorsTab)
    }
    if (event.key === 'ArrowRight') {
      setRightActiveTab(activeOperatorsTab)
    }
  }

  const setLeftActiveTab = (currentActiveTab: string) => {
    const currentTabIndex = operatorTypes.findIndex((tab) => tab.title === currentActiveTab)
    const nextTabIndex = currentTabIndex - 1
    if (nextTabIndex < 0) {
      activeOperatorsTab = operatorTypes[operatorTypes.length - 1].title
      document.getElementById(`${activeOperatorsTab}-${layer.definition.id}`)?.focus()
    } else {
      activeOperatorsTab = operatorTypes[nextTabIndex].title
      document.getElementById(`${activeOperatorsTab}-${layer.definition.id}`)?.focus()
    }
  }

  const setRightActiveTab = (currentActiveTab: string) => {
    const currentTabIndex = operatorTypes.findIndex((tab) => tab.title === currentActiveTab)
    const nextTabIndex = currentTabIndex + 1
    const nextTab = operatorTypes[nextTabIndex]
    if (nextTab) {
      activeOperatorsTab = nextTab.title
      document.getElementById(`${activeOperatorsTab}-${layer.definition.id}`)?.focus()
    } else {
      activeOperatorsTab = operatorTypes[0].title
      document.getElementById(`${activeOperatorsTab}-${layer.definition.id}`)?.focus()
    }
  }
</script>

<div
  on:click={() => {
    showTooltip = !showTooltip
  }}
  on:keydown={handleEnterKey}
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
                <a
                  id="{type.title}-{layer.definition.id}"
                  style="border: none;"
                  on:click={() => handleSetOperatorType(type.title)}
                  on:keydown={handleKeyDown}
                  role="tab"
                  tabindex="0">
                  <Fa icon={type.icon} style="color: #232E3D" />
                </a>
              </li>
            {/each}
          </ul>
          <div
            tabindex="0"
            style="cursor: pointer"
            class="column is-1 close"
            alt="Close Expression Builder"
            title="Close Expression Builder"
            role="button"
            aria-label="Close Expression Builder"
            on:click={() => (showTooltip = false)}
            on:keydown={handleEnterKey}>
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
