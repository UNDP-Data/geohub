<script lang="ts">
  import DeleteButton from '$components/controls/DeleteButton.svelte'
  import VisibilityButton from '$components/controls/VisibilityButton.svelte'
  import DataCardInfoButton from '$components/controls/DataCardInfoButton.svelte'
  import ZoomToLayerButton from '$components/controls/ZoomToLayerButton.svelte'
  import { LayerIconTypes, LayerTypes } from '$lib/constants'
  import { clean, getLayerStyle } from '$lib/helper'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import { onDestroy, onMount } from 'svelte'
  import RasterBandSelector from '$components/controls/RasterBandSelector.svelte'

  export let layer: Layer
  let hasLayerLabel = false

  onMount(() => {
    if (!$map) return
    $map.on('label:changed', handleLabelChanged)
  })

  onDestroy(() => {
    $map.off('label:changed', handleLabelChanged)
  })

  const handleLabelChanged = (e: { parentId: string; layerId: string; isCreated: boolean }) => {
    if (e.parentId !== layer.id) return
    hasLayerLabel = e.isCreated ?? false
  }

  const layerStyle = getLayerStyle($map, layer.id)

  let icon = LayerIconTypes.find((icon) => icon.id === layerStyle.type)
  if (layerStyle.type !== LayerTypes.RASTER) {
    switch (layerStyle.type) {
      case 'fill':
        icon = LayerIconTypes.find((icon) => icon.id === 'polygon')
        break
      case 'line':
        icon = LayerIconTypes.find((icon) => icon.id === 'line')
        break
      case 'symbol':
        icon = LayerIconTypes.find((icon) => icon.id === 'point')
        break
      case 'heatmap':
        icon = LayerIconTypes.find((icon) => icon.id === 'heatmap')
        break
    }
  }
</script>

<div class="layer-header">
  <div>
    <div class="layer-header-name">
      <i
        class="{icon.icon} sm"
        style="color: {icon.color};" />
      <span style="padding-left: 5px;">
        {#if hasLayerLabel}
          <span class="tag is-info"><i class="fa-solid fa-text-height" /></span>
        {/if}
      </span>
      {#if layerStyle.type === 'raster'}
        <RasterBandSelector {layer} />
      {/if}
      <div class="layer-name pl-1">
        <div>
          {clean(layer.name)}
        </div>
      </div>
      <div class="group">
        <DataCardInfoButton {layer} />
        <VisibilityButton {layer} />
        <DeleteButton {layer} />
        <ZoomToLayerButton {layer} />
      </div>
    </div>
  </div>
</div>
<slot />

<style lang="scss">
  .layer-header {
    .layer-header-name {
      align-items: center;
      display: flex;
      font-family: ProximaNova, sans-serif;
      height: 20px;
      justify-content: left;

      .layer-name {
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        display: -webkit-box;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      }
    }

    .group {
      display: flex;
    }
  }
</style>
