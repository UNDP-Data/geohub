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
  import RasterHistogram from './RasterHistogram.svelte'

  export let layer: Layer = LayerInitialValues

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

  const tabs = [
    { label: TabNames.LEGEND, icon: faList, active: false },
    { label: TabNames.HISTOGRAM, icon: faChartColumn, active: false },
    { label: TabNames.REFINE, icon: faCalculator, active: false },
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
      {#if isHistogramPanelVisible}
        <RasterHistogram bind:layer />
      {/if}
      {#if isRefinePanelVisible === true}
        <!-- <RefineContainer bind:layer /> -->
        <RasterExpression bind:layer />
      {/if}
      <OpacityPanel {layer} {isOpacityPanelVisible} />
    </p>
  </nav>
</div>

<style lang="scss">
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
      padding-top: 15px;
    }
  }
</style>
