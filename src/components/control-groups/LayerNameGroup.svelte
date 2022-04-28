<script lang="ts">
  import LayerControlGroup from '$components/control-groups/LayerControlGroup.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import { clean } from '$lib/helper'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues

  const name = clean(layer.name)
  import Tooltip, { Wrapper } from '@smui/tooltip'
</script>

<div class="layer-header">
  <div>
    <div class="layer-header-name">
      <div class="layer-name">
        <Wrapper>
          <div>{name}</div>
          <Tooltip showDelay={500} hideDelay={100} yPos="above">{name}</Tooltip>
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
      display: flex;
      justify-content: left;
      align-items: center;
      font-family: ProximaNova, sans-serif;
      height: 20px;

      .layer-name {
        display: -webkit-box;
        font-size: 14px;
        width: 100%;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
</style>
