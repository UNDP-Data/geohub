<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'

  import LayerControlGroup from '$components/control-groups/LayerControlGroup.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import { clean } from '$lib/helper'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues

  const name = clean(layer.name)
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
</style>
