<script lang="ts">
  import type { StyleSpecification } from 'maplibre-gl'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import RasterLayer from '$components/RasterLayer.svelte'
  import VectorLayer from '$components/VectorLayer.svelte'
  import { map, layerList } from '$stores'
  import { TabNames } from '$lib/config/AppConfig'
  import { getLayerStyle } from '$lib/helper'
  import Notification from './controls/Notification.svelte'
  import LayerOrder from './LayerOrder.svelte'
  import type { SavedMapStyle } from '$lib/types'

  export let contentHeight: number
  export let activeTab: string

  let layerHeaderHeight = 39

  $: totalHeight = contentHeight - layerHeaderHeight

  let savedStylePromise: Promise<SavedMapStyle> = $page.data.promises?.style
  savedStylePromise?.then((styleInfo) => {
    if (!styleInfo) {
      $page.url.searchParams.delete('style')
      goto(`?${$page.url.searchParams.toString()}`)
      return
    }

    const style: StyleSpecification = styleInfo.style
    $map.setStyle(style)

    $map.flyTo({
      center: [style.center[0], style.center[1]],
      zoom: style.zoom,
      bearing: style.bearing,
      pitch: style.pitch,
    })
    activeTab = TabNames.LAYERS
    if (!$map.isStyleLoaded()) {
      $map.once('styledata', () => {
        $layerList = styleInfo.layers
      })
    } else {
      $layerList = styleInfo.layers
    }
  })
</script>

{#if $layerList?.length > 0}
  <div
    class="layer-header px-2 pt-2"
    bind:clientHeight={layerHeaderHeight}>
    <div class="layer-order">
      <LayerOrder />
    </div>
  </div>
{/if}
<div
  class="layer-list mx-2 mt-1"
  style="height: {totalHeight}px;">
  {#if $layerList?.length === 0}
    <Notification type="info">
      No layers have been selected. Please select a layer from the <strong>{TabNames.DATA}</strong> tab.
    </Notification>
  {/if}

  {#each $layerList as layer (layer.id)}
    <div class="box p-0 mx-1 my-3">
      {#if getLayerStyle($map, layer.id).type === 'raster'}
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
