<script lang="ts">
  import LayerControlGroup from '$components/control-groups/LayerControlGroup.svelte'
  import { LayerIconTypes, LayerTypes } from '$lib/constants'
  import { clean } from '$lib/helper'
  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { layerLabelled, treeBucket } from '$stores'
  import { join, split } from 'lodash'

  export let layer: Layer
  let info: RasterTileMetadata
  let bandName = ''

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ;({ info } = layer)

  if (layer.definition.type === 'raster') {
    if (layer.tree?.isMosaicJSON) {
      bandName = 'Mosaic'
    } else {
      bandName = `B${info?.active_band_no}`
    }
  }

  let icon = LayerIconTypes.find((icon) => icon.id === layer.definition.type)
  if (layer.definition.type !== LayerTypes.RASTER) {
    switch (layer.definition.type) {
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
      <div style="display: flex; align-items: center">
        <i
          class="{icon.icon} sm"
          style="color: {icon.color};" />
        <span style="padding-left: 5px;">
          {#if $layerLabelled[layer.definition.id]}
            <span class="tag is-info"><i class="fa-solid fa-text-height" /></span>
          {/if}
        </span>
      </div>
      {#if layer.definition.type === 'raster'}
        <div style="display: flex; align-items: center">
          <span class="tag is-success">{bandName}</span>
        </div>
      {/if}
      <div class="layer-name">
        <div>
          <span style="padding-left: 5px;">
            {#if layer.tree?.isMosaicJSON}
              {layer.tree.label}
            {:else if layer.tree?.dynamicSourceType}
              {clean(layer.tree.path.split('.').join(' '))}
            {:else}
              {clean(layer.name)}
            {/if}
          </span>
        </div>
      </div>
      <div>
        <LayerControlGroup {layer} />
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
  }

  .label {
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
    margin-bottom: 10px;
    color: #fff;

    @media (prefers-color-scheme: dark) {
      color: #fff;
    }
  }

  .description,
  .unit {
    font-weight: normal;
    color: #fff;
    margin-bottom: 10px;

    @media (prefers-color-scheme: dark) {
      color: #fff;
    }
  }

  .description {
    margin-bottom: 15px;
  }
</style>
