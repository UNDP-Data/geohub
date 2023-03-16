<script lang="ts">
  import { fade } from 'svelte/transition'
  import RasterLegend from '$components/controls/RasterLegend.svelte'
  import RasterTransform from '$components/controls/RasterTransform.svelte'
  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import { TabNames } from '$lib/config/AppConfig'
  import type { Layer, RasterTileMetadata } from '$lib/types'
  import RasterHistogram from '$components/controls/RasterHistogram.svelte'
  import { Tabs } from '@undp-data/svelte-undp-design'
  import { page } from '$app/stores'

  export let layer: Layer

  let numberOfClasses = $page.data.config.NumberOfClasses
  let legendType

  const rasterInfo: RasterTileMetadata = layer.info
  const colorinterp = rasterInfo.colorinterp
  const isRgbTile =
    colorinterp && colorinterp.includes('red') && colorinterp.includes('green') && colorinterp.includes('blue')

  //local vars
  let tabs = isRgbTile
    ? [
        { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
        { label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' },
      ]
    : [
        { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
        { label: TabNames.HISTOGRAM, icon: 'fa-solid fa-chart-column' },
        { label: TabNames.TRANSFORM, icon: 'fa-solid fa-shuffle' },
        { label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' },
      ]

  let { info }: Layer = layer
  let activeTab = TabNames.LEGEND

  if ((info as RasterTileMetadata)?.isMosaicJson === true) {
    // disable other menus since they are not working for mosaicjson layer currently
    tabs = [{ label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' }]
    if ((info as RasterTileMetadata).band_metadata.length < 2) {
      tabs = [
        { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
        { label: TabNames.HISTOGRAM, icon: 'fa-solid fa-chart-column' },
        ...tabs,
      ]
    }
  }
</script>

<div
  class="raster-layer-container has-background-white-bis"
  transition:fade>
  <nav class="panel">
    <p class="panel-heading has-background-grey-lighter p-2">
      <LayerNameGroup {layer} />
    </p>
    <Tabs
      bind:tabs
      bind:activeTab
      fontSize="medium"
      isToggleTab={true} />
    <p class="panel-content">
      {#if activeTab === TabNames.LEGEND}
        <RasterLegend
          bind:layer
          bind:numberOfClasses
          bind:legendType />
      {/if}
      {#if !isRgbTile}
        {#if activeTab === TabNames.HISTOGRAM}
          <RasterHistogram bind:layer />
        {/if}
        {#if activeTab === TabNames.TRANSFORM}
          <RasterTransform bind:layer />
        {/if}
      {/if}
      {#if activeTab === TabNames.OPACITY}
        <OpacityPanel {layer} />
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
  .loader-container {
    display: flex;
    align-items: center;
    width: fit-content;
    margin: 0 auto;
  }
</style>
