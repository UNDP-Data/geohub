<script lang="ts">
  import { onMount } from 'svelte'
  import type { StyleSpecification } from 'maplibre-gl'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import RasterLayer from '$components/RasterLayer.svelte'
  import VectorLayer from '$components/VectorLayer.svelte'
  import { map, layerList, indicatorProgress } from '$stores'
  import { ClassificationMethodTypes, LayerTypes, TabNames } from '$lib/constants'
  import { getLayerStyle, getRandomColormap } from '$lib/helper'
  import Notification from './controls/Notification.svelte'
  import LayerOrder from './LayerOrder.svelte'

  export let headerHeight: number = undefined
  export let tabsHeight: number = undefined
  export let activeTab: string
  let marginTop = 5
  let layerHeaderHeight = 39

  let restoredStyle: StyleSpecification

  onMount(async () => {
    try {
      $indicatorProgress = true
      const styleId = $page.url.searchParams.get('style')
      if (!(styleId && $layerList.length === 0)) return
      const res = await fetch(`/api/style/${styleId}`)
      if (!res.ok) {
        $page.url.searchParams.delete('style')
        goto(`?${$page.url.searchParams.toString()}`)
        return
      }
      const styleInfo = await res.json()
      restoredStyle = styleInfo.style
      if (styleInfo.layers) {
        $layerList = styleInfo.layers
        const style: StyleSpecification = styleInfo.style
        $map.setStyle(style)
        $map.flyTo({
          center: [style.center[0], style.center[1]],
          zoom: style.zoom,
          bearing: style.bearing,
          pitch: style.pitch,
        })
        activeTab = TabNames.LAYERS
      } else {
        $page.url.searchParams.delete('style')
        goto(`?${$page.url.searchParams.toString()}`)
      }
    } finally {
      $indicatorProgress = false
    }
  })

  const getClassificationMethod = (layerId: string) => {
    const layerStyle = restoredStyle?.layers.find((l) => l.id === layerId)
    let classificationMethod = ClassificationMethodTypes.EQUIDISTANT
    if (['fill', 'symbol'].includes(layerStyle?.type)) {
      classificationMethod = ClassificationMethodTypes.NATURAL_BREAK
    }
    if (layerStyle && layerStyle['classification']) {
      classificationMethod = layerStyle['classification']
    }
    return classificationMethod
  }

  const getColormapName = (layerId: string) => {
    const layerStyle = restoredStyle?.layers.find((l) => l.id === layerId)
    let colorMapName: string
    if (layerStyle && layerStyle['colormap']) {
      colorMapName = layerStyle['colormap']
    }
    if (!colorMapName) {
      colorMapName = getRandomColormap()
    }
    return colorMapName
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
    <Notification type="">
      No layers have been selected. Please select a layer from the <strong>{TabNames.DATA}</strong> tab.
    </Notification>
  {/if}

  {#each $layerList as layer (layer.id)}
    <div class="box p-0 mx-1 my-3">
      {#if getLayerStyle($map, layer.id).type === LayerTypes.RASTER}
        <RasterLayer
          {layer}
          classificationMethod={getClassificationMethod(layer.id)} />
      {:else}
        <VectorLayer
          {layer}
          classificationMethod={getClassificationMethod(layer.id)}
          colorMapName={getColormapName(layer.id)} />
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
