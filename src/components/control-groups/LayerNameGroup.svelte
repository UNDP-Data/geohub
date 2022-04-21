<script lang="ts">
  import LayerControlGroup from '$components/control-groups/LayerControlGroup.svelte'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues } from '$lib/constants'

  export let layer: Layer = LayerInitialValues

  const name = layer.name
</script>

<div class="layer-header">
  <div>
    <div class="layer-header-name">
      <div class="layer-name">
        {name}
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        font-size: 14px;
      }
    }
  }
</style>
