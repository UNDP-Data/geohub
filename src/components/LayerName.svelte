<script lang="ts">
  import Tag from 'svelma/src/components/Tag/Tag.svelte'

  import { map } from '../stores'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  export let layerConfig: Layer = LayerInitialValues

  let name: string, definition: LayerDefinition
  ;({ name, definition } = layerConfig)
  const layerId = definition.id

  const mapLayers = $map.getStyle().layers
  const mapLayerByLayerId = mapLayers.filter((item: LayerDefinition) => item.id == layerId).pop()
  export let mapLayerIndex = mapLayers.indexOf(mapLayerByLayerId)
</script>

<div class="layer-header">
  <div>
    <div class="layer-header-name">
      <div class="layer-name">
        {name}
      </div>
      <div class="unread-count">
        <div style="float: right;">
          <Tag type="is-info" size="is-small">{mapLayerIndex} / {mapLayers.length}</Tag>
        </div>
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

      .unread-count {
        padding-left: 7.5px;
      }
    }
  }
</style>
