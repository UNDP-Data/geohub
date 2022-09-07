<script lang="ts">
  import { fade } from 'svelte/transition'
  import Fa from 'svelte-fa'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'
  import { faList } from '@fortawesome/free-solid-svg-icons/faList'
  import { faTextHeight } from '@fortawesome/free-solid-svg-icons/faTextHeight'

  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import VectorLegendPanel from '$components/controls/VectorLegendPanel.svelte'
  import VectorLabelPanel from '$components/controls/VectorLabelPanel.svelte'
  import VectorFilterPanel from '$components/controls/VectorFilterPanel.svelte'

  import { LayerInitialValues, TabNames } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter'

  export let layer: Layer = LayerInitialValues

  let activeTab = ''
  let isLabelPanelVisible: boolean
  let isLegendPanelVisible: boolean
  let isOpacityPanelVisible: boolean
  let isFilterPanelVisible: boolean

  let tabs = [
    { label: TabNames.LEGEND, icon: faList, active: false },
    { label: TabNames.FILTER, icon: faFilter, active: false },
    { label: TabNames.LABEL, icon: faTextHeight, active: false },
    { label: TabNames.OPACITY, icon: faDroplet, active: false },
  ]

  $: {
    isLabelPanelVisible = false
    isLegendPanelVisible = false
    isOpacityPanelVisible = false
    isFilterPanelVisible = false
    switch (activeTab) {
      case TabNames.LEGEND:
        isLegendPanelVisible = true
        break
      case TabNames.FILTER:
        isFilterPanelVisible = true
        break
      case TabNames.LABEL:
        isLabelPanelVisible = true
        break
      case TabNames.OPACITY:
        isOpacityPanelVisible = true
        break
      default:
        break
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

<div class="vector-layer-container" transition:fade data-testid="vector-layer-view-container">
  <nav class="panel">
    <p class="panel-heading">
      <LayerNameGroup {layer} />
    </p>
    <ul class="panel-tabs" role="tablist" tabindex="0">
      {#each tabs as tab}
        <li>
          <a
            role="tab"
            aria-label={tab.label}
            id={`${tab.label}-${layer.definition.id}`}
            on:keydown={handleKeyDown}
            href={'#'}
            on:click={() => (activeTab === tab.label ? (activeTab = '') : (activeTab = tab.label))}
            class={activeTab === tab.label ? 'is-active' : ''}
            alt={`${tab.label} Tab Link`}
            title={`${tab.label} Tab Link`}>
            <span>
              <Fa icon={tab.icon} size="sm" />
            </span>
            {tab.label}
          </a>
        </li>
      {/each}
    </ul>
    <p class="panel-content">
      <VectorLegendPanel {layer} {isLegendPanelVisible} />
      <VectorFilterPanel {layer} {isFilterPanelVisible} />
      <VectorLabelPanel {layer} {isLabelPanelVisible} />
      <OpacityPanel {layer} {isOpacityPanelVisible} />
    </p>
  </nav>
</div>

<style lang="scss">
  $gray-700: #232e3d;
  $dark-red: #d12800;
  .is-active {
    border-bottom: 2px solid $dark-red !important;
  }
  .vector-layer-container {
    margin-left: 15px;
    margin-bottom: 20px;
    min-width: min-content;

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
