<script lang="ts">
  import { fade } from 'svelte/transition'
  import RasterLegendContainer from '$components/controls/RasterLegendContainer.svelte'
  import RasterExpression from '$components/controls/RasterExpression.svelte'
  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import { ClassificationMethodTypes, DynamicLayerLegendTypes, LayerInitialValues, TabNames } from '$lib/constants'
  import type { Layer, RasterSimpleExpression, RasterTileMetadata } from '$lib/types'
  import RasterHistogram from '$components/controls/RasterHistogram.svelte'
  import { Tabs } from '@undp-data/svelte-undp-design'

  export let layer: Layer = LayerInitialValues
  let expressions: RasterSimpleExpression[]

  let activeTab = ''
  let isRefinePanelVisible = false
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
  let isHistogramPanelVisible = false
  let colorMapName: string = undefined
  let classificationMethod: ClassificationMethodTypes = ClassificationMethodTypes.EQUIDISTANT
  let legendType: DynamicLayerLegendTypes

  $: {
    isLegendPanelVisible = false
    isRefinePanelVisible = false
    isOpacityPanelVisible = false
    isHistogramPanelVisible = false
    switch (activeTab) {
      case TabNames.LEGEND:
        isLegendPanelVisible = true
        break
      case TabNames.TRANSFORM:
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
    { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
    { label: TabNames.HISTOGRAM, icon: 'fa-solid fa-chart-column' },
    { label: TabNames.TRANSFORM, icon: 'fa-solid fa-shuffle' },
    { label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' },
  ]

  $: {
    const rasterInfo = layer.info as RasterTileMetadata
    if (rasterInfo?.isMosaicJson === true) {
      // disable other menus since they are not working for mosaicjson layer currently
      tabs = [{ label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' }]
      if (rasterInfo.band_metadata.length < 2) {
        tabs = [
          { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
          { label: TabNames.HISTOGRAM, icon: 'fa-solid fa-chart-column' },
          ...tabs,
        ]
      }
    }
  }
</script>

<div
  class="raster-layer-container has-background-white-bis"
  transition:fade>
  <nav class="panel">
    <p class="panel-heading has-background-grey-lighter">
      <LayerNameGroup {layer} />
    </p>
    <Tabs
      bind:tabs
      bind:activeTab
      fontSize="small"
      isToggleTab={true} />

    <p class="panel-content">
      {#if isLegendPanelVisible === true}
        <RasterLegendContainer
          bind:layer
          bind:colorMapName
          bind:classificationMethod
          bind:legendType />
      {/if}
      {#if isHistogramPanelVisible}
        <RasterHistogram bind:layer />
      {/if}
      {#if isRefinePanelVisible === true}
        <RasterExpression
          bind:layer
          bind:expressions
          bind:legendType />
      {/if}
      <OpacityPanel
        {layer}
        {isOpacityPanelVisible} />
    </p>
  </nav>
</div>

<style lang="scss">
  .raster-layer-container {
    .panel-content {
      padding: 10px;
      padding-top: 15px;
    }
  }
</style>
