<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import LayerControlGroup from '$components/control-groups/LayerControlGroup.svelte'
  import { LayerIconTypes, LayerTypes } from '$lib/constants'
  import { clean, hash } from '$lib/helper'
  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { layerLabelled, layerMetadata } from '$stores'
  import { faTextHeight } from '@fortawesome/free-solid-svg-icons/faTextHeight'

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

  let icon = LayerIconTypes.find((icon) => icon.id === layer.type)
  if (layer.type === LayerTypes.VECTOR) {
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

  const name = clean(layer.name)
  const layerInfoMetadata = $layerMetadata.get(hash(layer.definition.source))
</script>

<div class="layer-header">
  <div>
    <div class="layer-header-name">
      <div style="display: flex; align-items: center">
        <Fa icon={icon.icon} size="sm" primaryColor={icon.color} />
        <span style="padding-left: 5px;">
          {#if $layerLabelled[layer.definition.id]}
            <span class="tag is-info"><Fa icon={faTextHeight} /></span>
          {/if}
        </span>
      </div>
      {#if layer.definition.type === 'raster'}
        <div style="display: flex; align-items: center">
          <span class="tag is-success">{bandName}</span>
        </div>
      {/if}
      <div class="layer-name">
        <Wrapper>
          <div>
            <span style="padding-left: 5px;">
              {#if layer.tree?.isMosaicJSON}
                {layer.tree.label}
              {:else}
                {name}
              {/if}
            </span>
          </div>
          <Tooltip showDelay={250} hideDelay={0} yPos="above" style="background-color: #ccc; border-radius: 7.5px;">
            <div class="label has-text-left">{clean(name)}</div>
            <div class="description has-text-left">
              {layerInfoMetadata?.description ? layerInfoMetadata?.description : 'N/A'}
            </div>
            <div class="unit is-size-7 has-text-left">
              <span class="has-text-weight-bold">Unit: </span>{layerInfoMetadata?.unit ? layerInfoMetadata.unit : 'N/A'}
            </div>
          </Tooltip>
        </Wrapper>
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
