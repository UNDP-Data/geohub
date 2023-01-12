<script
  lang="ts"
  context="module">
  let nlayers = 0
</script>

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

  export let headerHeight: number = undefined
  export let tabsHeight: number = undefined
  export let activeTab: string
  let marginTop = 5
  let layerHeaderHeight = 39

  const getLegendState = async () => {
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

      if (styleInfo.layers) {
        let legendState = {}
        //console.log('restoring ', styleInfo.layers.length)
        const style: StyleSpecification = styleInfo.style

        styleInfo.layers.map((el) => {
          const layerStyle = style.layers.find((l) => l.id === el.id)
          const cmap = layerStyle?.['colormap']
          const classification = layerStyle?.['classification']
          const lid = layerStyle?.['id']
          if (cmap && classification && lid) {
            //reuse state
            legendState[lid] = { classification: classification, colorMapName: cmap }
          }

          //console.log(JSON.stringify(legendState))
        })

        // the state has been restored this assignement will trigger UI rendering

        $map.setStyle(style)
        $map.flyTo({
          center: [style.center[0], style.center[1]],
          zoom: style.zoom,
          bearing: style.bearing,
          pitch: style.pitch,
        })
        $layerList = styleInfo.layers
        activeTab = TabNames.LAYERS
        return legendState
      } else {
        $page.url.searchParams.delete('style')
        //goto(`?${$page.url.searchParams.toString()}`)
      }
    } finally {
      $indicatorProgress = false
    }
  }

  let legendState = getLegendState()
</script>

{#await legendState then ls}
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
      {@const cls = ls?.[layer.id]?.classification || ClassificationMethodTypes.EQUIDISTANT}
      <div class="box p-0 mx-1 my-3">
        {#if getLayerStyle($map, layer.id).type === LayerTypes.RASTER}
          {@const cmp = ls?.[layer.id]?.colorMapName || getValueFromRasterTileUrl($map, layer.id, 'colormap_name')}
          <RasterLayer
            {layer}
            classificationMethod={cls}
            colorMapName={cmp} />
        {:else}
          {@const cmp = ls?.[layer.id]?.colorMapName || getRandomColormap()}
          <VectorLayer
            {layer}
            classificationMethod={cls}
            colorMapName={cmp} />
        {/if}
      </div>
    {/each}
  </div>
{/await}

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
