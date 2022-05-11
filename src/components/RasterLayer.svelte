<script lang="ts">
  import Fa from 'svelte-fa'
  import { fade } from 'svelte/transition'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'
  import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter'
  import { faList } from '@fortawesome/free-solid-svg-icons/faList'

  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import ZoomLevelPanel from '$components/controls/ZoomLevelPanel.svelte'
  import RasterLegendContainer from '$components/RasterLegendContainer.svelte'
  import { LayerInitialValues, TabNames } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues

  let activeTab = ''
  let isFilterPanelVisible = false
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
  let isZoomLevelPanelVisible = false

  $: {
    isLegendPanelVisible = false
    isOpacityPanelVisible = false
    isZoomLevelPanelVisible = false

    switch (activeTab) {
      case TabNames.LEGEND:
        isLegendPanelVisible = true
        break
      case TabNames.FILTER:
        isFilterPanelVisible = true
        break
      case TabNames.OPACITY:
        isOpacityPanelVisible = true
        break
      case TabNames.ZOOM:
        isZoomLevelPanelVisible = true
        break
      default:
        break
    }
  }

  const tabs = [
    { label: TabNames.LEGEND, icon: faList, active: false },
    { label: TabNames.FILTER, icon: faFilter, active: false },
    { label: TabNames.OPACITY, icon: faDroplet, active: false },
  ]
</script>

<div class="raster-layer-container" transition:fade>
  <nav class="panel">
    <p class="panel-heading">
      <LayerNameGroup {layer} />
    </p>
    <p class="panel-tabs">
      {#each tabs as tab}
        <a
          href={'#'}
          on:click={() => (activeTab === tab.label ? (activeTab = '') : (activeTab = tab.label))}
          class={activeTab === tab.label ? 'is-active' : ''}>
          <span>
            <Fa icon={tab.icon} size="sm" />
          </span>
          {tab.label}
        </a>
      {/each}
    </p>

    <p class="panel-content">
      {#if isLegendPanelVisible === true}
        <RasterLegendContainer bind:layer />
      {/if}
      <OpacityPanel {layer} {isOpacityPanelVisible} />
      <ZoomLevelPanel {layer} {isZoomLevelPanelVisible} />
    </p>
  </nav>
</div>

<style lang="scss">
  @import '../styles/bulma.css';

  .raster-layer-container {
    margin-left: 15px;
    margin-bottom: 20px;

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
    }
  }
</style>
