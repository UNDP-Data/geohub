<script lang="ts">
  import RasterLayer from '$components/RasterLayer.svelte'
  import VectorLayer from '$components/VectorLayer.svelte'
  import { map, layerList } from '$stores'
  import { LayerTypes, TabNames } from '$lib/constants'
  import { getLayerStyle } from '$lib/helper'
  import Notification from './controls/Notification.svelte'

  export let headerHeight: number
  export let tabsHeight: number
  let marginTop = 5
</script>

{#if $layerList?.length === 0}
  <Notification type="">
    No layers have been selected. Please select a layer from the <strong>{TabNames.DATA}</strong> tab.
  </Notification>
{/if}

<div
  class="layer-list"
  style="height: calc(100vh - {headerHeight + tabsHeight + marginTop}px); margin-top: {marginTop}px;">
  {#each $layerList as layer (layer.id)}
    {#if getLayerStyle($map, layer.id).type === LayerTypes.RASTER}
      <RasterLayer {layer} />
    {:else}
      <VectorLayer {layer} />
    {/if}
  {/each}
</div>

<style lang="scss">
  .layer-list {
    overflow-y: auto;
  }
</style>
