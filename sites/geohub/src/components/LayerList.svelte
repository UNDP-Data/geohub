<script lang="ts">
  import type { StyleSpecification } from 'maplibre-gl'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import RasterLayer from '$components/RasterLayer.svelte'
  import VectorLayer from '$components/VectorLayer.svelte'
  import { map, layerList, indicatorProgress } from '$stores'
  import { ClassificationMethodTypes, LayerTypes, TabNames } from '$lib/constants'
  import { getLayerStyle, getRandomColormap, getValueFromRasterTileUrl } from '$lib/helper'
  import Notification from './controls/Notification.svelte'
  import LayerOrder from './LayerOrder.svelte'
  import type { LegendState } from '$lib/types'

  export let headerHeight: number = undefined
  export let tabsHeight: number = undefined
  export let activeTab: string
  let marginTop = 5
  let layerHeaderHeight = 39
  let legendState: LegendState = $page.data.style?.legendState

  const getLegendState = () => {
    return new Promise<LegendState>((resolve) => {
      try {
        $indicatorProgress = true
        const styleInfo = $page.data.style
        if (!styleInfo || !styleInfo?.legendState) {
          $page.url.searchParams.delete('style')
          if ($page.url.pathname === '/viewer') {
            goto(`../?${$page.url.searchParams.toString()}`)
          } else {
            goto(`?${$page.url.searchParams.toString()}`)
          }
          resolve({})
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
            resolve(styleInfo.legendState)
          })
        } else {
          $layerList = styleInfo.layers
          resolve(styleInfo.legendState)
        }
      } finally {
        $indicatorProgress = false
      }
    })
  }

  $: if ($map) {
    $map.once('load', () => {
      getLegendState()
    })
  }
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
  style="height: calc(100vh - {headerHeight +
    tabsHeight +
    layerHeaderHeight +
    marginTop}px); margin-top: {marginTop}px;">
  {#if $layerList?.length === 0}
    <Notification type="info">
      No layers have been selected. Please select a layer from the <strong>{TabNames.DATA}</strong> tab.
    </Notification>
  {/if}

  {#each $layerList as layer (layer.id)}
    {@const cls = legendState?.[layer.id]?.classification || ClassificationMethodTypes.EQUIDISTANT}
    <div class="box p-0 mx-1 my-3">
      {#if getLayerStyle($map, layer.id).type === LayerTypes.RASTER}
        {@const cmp =
          legendState?.[layer.id]?.colorMapName || getValueFromRasterTileUrl($map, layer.id, 'colormap_name')}
        <RasterLayer
          {layer}
          classificationMethod={cls}
          colorMapName={cmp} />
      {:else}
        {@const cmp = legendState?.[layer.id]?.colorMapName || getRandomColormap()}
        <VectorLayer
          {layer}
          classificationMethod={cls}
          colorMapName={cmp} />
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
