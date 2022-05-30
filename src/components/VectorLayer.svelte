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
  import { LayerInitialValues, TabNames } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues

  let activeTab = ''
  let isLabelPanelVisible = false
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false

  let tabs = [
    { label: TabNames.LEGEND, icon: faList, active: false },
    { label: TabNames.LABEL, icon: faTextHeight, active: false },
    { label: TabNames.OPACITY, icon: faDroplet, active: false },
  ]

  $: {
    isLabelPanelVisible = false
    isLegendPanelVisible = false
    isOpacityPanelVisible = false

    switch (activeTab) {
      case TabNames.LEGEND:
        isLegendPanelVisible = true
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
</script>

<div class="vector-layer-container" transition:fade data-testid="vector-layer-view-container">
  <nav class="panel">
    <p class="panel-heading">
      <LayerNameGroup {layer} />
    </p>
    <p class="panel-tabs">
      {#each tabs as tab}
        <a
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
      {/each}
    </p>

    <p class="panel-content">
      <VectorLegendPanel {layer} {isLegendPanelVisible} />
      <VectorLabelPanel {layer} {isLabelPanelVisible} />
      <OpacityPanel {layer} {isOpacityPanelVisible} />
    </p>
  </nav>
</div>

<style lang="scss">
  .vector-layer-container {
    margin-left: 15px;
    margin-bottom: 20px;
    min-width: min-content;

    .panel-tabs {
      padding-top: 10px;

      a {
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
