<script lang="ts">
  import { page } from '$app/stores'
  import DeleteButton from '$components/controls/DeleteButton.svelte'
  import VisibilityButton from '$components/controls/VisibilityButton.svelte'
  import DataCardInfoButton from '$components/controls/DataCardInfoButton.svelte'
  import ZoomToLayerButton from '$components/controls/ZoomToLayerButton.svelte'
  import { clean, getLayerStyle } from '$lib/helper'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import { onDestroy, onMount } from 'svelte'
  import RasterBandSelector from '$components/controls/RasterBandSelector.svelte'
  import Legend from '$components/controls/vector-styles/Legend.svelte'

  const isReadonly = $page.data.readOnly

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

  let layerStyle = getLayerStyle($map, layer.id)
</script>

<div class="layer-header">
  <Legend
    bind:map={$map}
    bind:layer={layerStyle} />
  {#if hasLayerLabel}
    <span class="tag is-info ml-1"><i class="fa-solid fa-text-height" /></span>
  {/if}

  {#if layerStyle?.type === 'raster'}
    <span class="pl-1"><RasterBandSelector {layer} /></span>
  {/if}
  <div class="layer-name ml-1">
    <div>
      {clean(layer.name)}
    </div>
  </div>
  <div class="group">
    <DataCardInfoButton {layer} />
    <VisibilityButton {layer} />
    {#if !isReadonly}
      <DeleteButton {layer} />
    {/if}
    <ZoomToLayerButton {layer} />
  </div>
</div>
<slot />

<style lang="scss">
  .layer-header {
    display: flex;
    align-items: center;

    .layer-name {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      display: -webkit-box;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: ProximaNova, sans-serif;
      height: 20px;
      justify-content: left;
    }

    .group {
      display: flex;
      margin-left: auto;
    }
  }
</style>
