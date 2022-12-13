<script lang="ts">
  import RasterLayer from '$components/RasterLayer.svelte'
  import VectorLayer from '$components/VectorLayer.svelte'
  import { map, layerList } from '$stores'
  import { LayerTypes, TabNames } from '$lib/constants'
  import { getLayerStyle } from '$lib/helper'
  import Notification from './controls/Notification.svelte'
  import LayerOrder from './LayerOrder.svelte'

  export let headerHeight: number = undefined
  export let tabsHeight: number = undefined
  let marginTop = 5
</script>

<div class="layer-header px-2 pt-2">
  <div class="layer-order">
    <LayerOrder />
  </div>
</div>

<div
  class="layer-list mx-2 my-0"
  style="height: calc(100vh - {headerHeight + tabsHeight + marginTop}px); margin-top: {marginTop}px;">
  {#if $layerList?.length === 0}
    <Notification type="">
      No layers have been selected. Please select a layer from the <strong>{TabNames.DATA}</strong> tab.
    </Notification>
  {/if}

  {#each $layerList as layer (layer.id)}
    <div class="box p-0 mx-1 my-3">
      {#if getLayerStyle($map, layer.id).type === LayerTypes.RASTER}
        <RasterLayer {layer} />
      {:else}
        <VectorLayer {layer} />
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  .layer-header {
    display: flex;
    width: 100%;

    .layer-order {
      margin-left: auto;
    }
  }

  .layer-list {
    overflow-y: auto;
  }
</style>
