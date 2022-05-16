<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'

  import LayerControlGroup from '$components/control-groups/LayerControlGroup.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import { clean, hash } from '$lib/helper'
  import type { Layer } from '$lib/types'
  import { layerMetadata } from '$stores'

  export let layer: Layer = LayerInitialValues

  const name = clean(layer.name)
  const layerInfoMetadata = $layerMetadata.get(hash(layer.definition.source))
</script>

<div class="layer-header">
  <div>
    <div class="layer-header-name">
      <div class="layer-name">
        <Wrapper>
          <div>{name}</div>
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
