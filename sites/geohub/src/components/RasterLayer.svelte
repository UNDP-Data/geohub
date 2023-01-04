<script lang="ts">
  import { getValueFromRasterTileUrl } from '$lib/helper'
  import { fade } from 'svelte/transition'
  import RasterLegendContainer from '$components/controls/RasterLegendContainer.svelte'
  import RasterExpression from '$components/controls/RasterExpression.svelte'
  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import { ClassificationMethodTypes, DynamicLayerLegendTypes, TabNames } from '$lib/constants'
  import type { Layer, RasterSimpleExpression, RasterTileMetadata } from '$lib/types'
  import RasterHistogram from '$components/controls/RasterHistogram.svelte'
  import { Tabs } from '@undp-data/svelte-undp-design'
  import { map } from '$stores'
  import { onMount } from 'svelte'
  import type { MapDataEvent } from 'maplibre-gl' // eventually should be removed

  export let layer: Layer
  export let classificationMethod: ClassificationMethodTypes

  let expressions: RasterSimpleExpression[]

  let colorMapName: string

  let tabs = [
    { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
    { label: TabNames.HISTOGRAM, icon: 'fa-solid fa-chart-column' },
    { label: TabNames.TRANSFORM, icon: 'fa-solid fa-shuffle' },
    { label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' },
  ]

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  onMount(async () => {
    while ($map.loaded() == false) {
      await sleep(100)
    }
    colorMapName = getValueFromRasterTileUrl($map, layer.id, 'colormap_name') as string
  })

  let activeTab = TabNames.LEGEND
  let legendType: DynamicLayerLegendTypes

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
      fontSize="medium"
      isToggleTab={true} />

    <p class="panel-content">
      {#if activeTab == TabNames.LEGEND}
        <RasterLegendContainer
          bind:layer
          bind:colorMapName
          bind:classificationMethod
          bind:legendType />
      {/if}
      {#if activeTab == TabNames.HISTOGRAM}
        <RasterHistogram bind:layer />
      {/if}
      {#if activeTab == TabNames.TRANSFORM}
        <RasterExpression
          bind:layer
          bind:expressions
          bind:legendType />
      {/if}
      {#if activeTab == TabNames.OPACITY}
        <OpacityPanel
          {layer}
          isOpacityPanelVisible={true} />
      {/if}
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
