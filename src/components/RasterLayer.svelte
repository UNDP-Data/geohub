<script lang="ts">
  import Fa from 'svelte-fa'
  import { fade } from 'svelte/transition'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import { faList } from '@fortawesome/free-solid-svg-icons/faList'

  import RasterLegendContainer from '$components/RasterLegendContainer.svelte'
  import RasterExpression from '$components/RasterExpression.svelte'
  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import { LayerInitialValues, TabNames } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { faChartColumn } from '@fortawesome/free-solid-svg-icons/faChartColumn'
  import RasterHistogram from '$components/RasterHistogram.svelte'

  export let layer: Layer = LayerInitialValues

  $: tree = layer.tree

  let activeTab = ''
  let isRefinePanelVisible = false
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
  let isHistogramPanelVisible = false

  $: {
    isLegendPanelVisible = false
    isRefinePanelVisible = false
    isOpacityPanelVisible = false
    isHistogramPanelVisible = false
    switch (activeTab) {
      case TabNames.LEGEND:
        isLegendPanelVisible = true
        break
      case TabNames.REFINE:
        isRefinePanelVisible = true
        break
      case TabNames.OPACITY:
        isOpacityPanelVisible = true
        break
      case TabNames.HISTOGRAM:
        isHistogramPanelVisible = true
        break
      default:
        break
    }
  }

  let tabs = [
    { label: TabNames.LEGEND, icon: faList, active: false },
    { label: TabNames.HISTOGRAM, icon: faChartColumn, active: false },
    { label: TabNames.REFINE, icon: faCalculator, active: false },
    { label: TabNames.OPACITY, icon: faDroplet, active: false },
  ]

  $: {
    if (tree && tree.isMosaicJSON) {
      // disable other menus since they are not working for mosaicjson layer currently
      tabs = [{ label: TabNames.OPACITY, icon: faDroplet, active: false }]
      if (layer.info.band_metadata.length < 2) {
        tabs = [
          { label: TabNames.LEGEND, icon: faList, active: false },
          { label: TabNames.HISTOGRAM, icon: faChartColumn, active: false },
          ...tabs,
        ]
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
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
      document.getElementById(`${activeTab}-${layer.definition.id}`)?.focus()
    } else {
      activeTab = tabs[nextTabIndex].label
      document.getElementById(`${activeTab}-${layer.definition.id}`)?.focus()
    }
  }

  const setRightActiveTab = (currentActiveTab: string) => {
    const currentTabIndex = tabs.findIndex((tab) => tab.label === currentActiveTab)
    const nextTabIndex = currentTabIndex + 1
    const nextTab = tabs[nextTabIndex]
    if (nextTab) {
      activeTab = nextTab.label
      document.getElementById(`${activeTab}-${layer.definition.id}`)?.focus()
    } else {
      activeTab = tabs[0].label
      document.getElementById(`${activeTab}-${layer.definition.id}`)?.focus()
    }
  }
</script>

<div
  class="raster-layer-container"
  transition:fade>
  <nav class="panel">
    <p class="panel-heading">
      <LayerNameGroup {layer} />
    </p>
    <ul
      class="panel-tabs"
      role="tablist"
      tabindex="0">
      {#each tabs as tab, index}
        <li>
          <a
            role="tab"
            aria-label={tab.label}
            id={`${tab.label}-${layer.definition.id}`}
            on:keydown={handleKeyDown}
            href={'#'}
            on:click={() => (activeTab === tab.label ? (activeTab = '') : (activeTab = tab.label))}
            class={activeTab === tab.label ? 'is-active' : ''}>
            <span>
              <Fa
                icon={tab.icon}
                size="sm" />
            </span>
            {tab.label}
          </a>
        </li>
      {/each}
    </ul>

    <p class="panel-content">
      {#if isLegendPanelVisible === true}
        <RasterLegendContainer bind:layer />
      {/if}
      {#if isHistogramPanelVisible}
        <RasterHistogram bind:layer />
      {/if}
      {#if isRefinePanelVisible === true}
        <RasterExpression bind:layer />
      {/if}
      <OpacityPanel
        {layer}
        {isOpacityPanelVisible} />
    </p>
  </nav>
</div>

<style lang="scss">
  $gray-700: #232e3d;
  $dark-red: #d12800;

  .is-active {
    border-bottom: 2px solid $dark-red !important;
  }
  .raster-layer-container {
    margin-left: 15px;
    margin-bottom: 20px;

    .panel-tabs {
      padding-top: 10px;
      border: none;

      a {
        margin-right: 5px;
        font-weight: bold;
        text-transform: capitalize;
        color: $gray-700;
        font-family: ProximaNova, sans-serif;

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
