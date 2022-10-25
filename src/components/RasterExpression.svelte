<script lang="ts">
  import Fa from 'svelte-fa'

  import type { Layer } from '$lib/types'
  import RefineContainer from '$components/RefineContainer.svelte'
  import RasterExpressionSimple from './RasterExpressionSimple.svelte'
  import { faThumbsUp } from '@fortawesome/free-solid-svg-icons/faThumbsUp'
  import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassPlus'
  export let layer: Layer

  let activeTab = 'Simple'
  let isAdvancedPanelVisible = false
  let isSimplePanelVisible = false

  $: {
    isAdvancedPanelVisible = false
    isSimplePanelVisible = false

    switch (activeTab) {
      case 'Advanced':
        isAdvancedPanelVisible = true
        isSimplePanelVisible = false
        break
      case 'Simple':
        isSimplePanelVisible = true
        isAdvancedPanelVisible = false
        break

      default:
        break
    }
  }

  const tabs = [
    { label: 'Simple', icon: faThumbsUp, active: true },
    { label: 'Advanced', icon: faMagnifyingGlassPlus, active: false },
  ]

  const handleArrowKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      setLeftActiveTab(activeTab)
    }
    if (event.key === 'ArrowRight') {
      setRightActiveTab(activeTab)
    }
  }

  const setLeftActiveTab = (currentActiveTab: string) => {
    const currentTabIndex = tabs.findIndex((tab) => tab.label === currentActiveTab)
    const nextTabIndex = currentTabIndex - 1
    if (nextTabIndex < 0) {
      activeTab = tabs[tabs.length - 1].label
      document.getElementById(`expression-${activeTab}-${layer.definition.id}`)?.focus()
    } else {
      activeTab = tabs[nextTabIndex].label
      document.getElementById(`expression-${activeTab}-${layer.definition.id}`)?.focus()
    }
  }

  const setRightActiveTab = (currentActiveTab: string) => {
    const currentTabIndex = tabs.findIndex((tab) => tab.label === currentActiveTab)
    const nextTabIndex = currentTabIndex + 1
    const nextTab = tabs[nextTabIndex]
    if (nextTab) {
      activeTab = nextTab.label
      document.getElementById(`expression-${activeTab}-${layer.definition.id}`)?.focus()
    } else {
      activeTab = tabs[0].label
      document.getElementById(`expression-${activeTab}-${layer.definition.id}`)?.focus()
    }
  }
</script>

<nav class="block">
  <p class="panel-tabs">
    {#each tabs as tab}
      <a
        href={'#'}
        role="tab"
        aria-label={tab.label}
        id={`expression-${tab.label}-${layer.definition.id}`}
        on:click={() => (activeTab === tab.label ? (activeTab = '') : (activeTab = tab.label))}
        on:keydown={handleArrowKey}
        class={activeTab === tab.label ? 'is-active' : ''}>
        <span>
          <Fa
            icon={tab.icon}
            size="sm" />
        </span>
        {tab.label}
      </a>
    {/each}
  </p>
  <div class="block" />
  <p>
    {#if isSimplePanelVisible === true}
      <RasterExpressionSimple bind:layer />
    {/if}
    {#if isAdvancedPanelVisible}
      <RefineContainer bind:layer />
    {/if}
  </p>
</nav>

<style lang="scss">
  .is-active {
    border-bottom: 2px solid #d12800;
  }
  .raster-layer-container {
    margin-left: 15px;
    margin-bottom: 20px;

    .panel-tabs {
      padding-top: 10px;

      a {
        color: #232e3d;
        font-family: ProximaNova;
        margin-right: 5px;

        span {
          margin-right: 3px;
        }
      }
    }

    .panel-content {
      padding: 10px;
      padding-top: 15px;
    }
  }
</style>
