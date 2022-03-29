<script lang="ts">
  import Fa from 'svelte-fa'
  import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
  import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'

  import { map } from '../../stores'
  import type { Layer, LayerDefinition } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const mapLayers = $map.getStyle().layers
  const mapLayerByLayerId = mapLayers.find((item: LayerDefinition) => item.id === layerId)

  export let mapLayerIndex = mapLayers.indexOf(mapLayerByLayerId)

  const hierachyDown = (layerID: string) => {
    const newIndex = mapLayerIndex - 1

    if (newIndex >= 0) {
      $map.moveLayer(layerID, mapLayers[newIndex].id)
      mapLayerIndex = newIndex
      $map.triggerRepaint()
    }
  }

  const hierachyUp = (layerID: string) => {
    const newIndex = mapLayerIndex + 1

    if (newIndex <= mapLayers.length - 1) {
      $map.moveLayer(layerID, mapLayers[newIndex].id)
      mapLayerIndex = newIndex
      $map.triggerRepaint()
    }
  }
</script>

<div class="icon-selected" title="Move layer up (in map)" on:click={() => hierachyUp(layerId)}>
  <Fa icon={faChevronUp} size="1x" />
</div>

<div class="icon-selected" title="Move layer down (in map)" on:click={() => hierachyDown(layerId)}>
  <Fa icon={faChevronDown} size="1x" />
</div>

<style lang="scss">
  .icon-selected {
    opacity: 1;
    display: inline;
    cursor: pointer;
    margin-right: 10px;
  }
</style>
