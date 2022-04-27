<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Fa from 'svelte-fa'
  import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
  import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'

  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues } from '$lib/constants'
  import '../../styles/button-icons-selected.scss'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const mapLayers = $map.getStyle().layers
  const mapLayerByLayerId = mapLayers.find((item: LayerSpecification) => item.id === layerId)

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

<div class="grouped">
  <Wrapper>
    <div class="icon-selected" on:click={() => hierachyUp(layerId)}>
      <Fa icon={faChevronUp} size="1x" />
    </div>
    <Tooltip showDelay={300} hideDelay={100} yPos="above">Bring Forward in Map</Tooltip>
  </Wrapper>

  <Wrapper>
    <div class="icon-selected" on:click={() => hierachyDown(layerId)}>
      <Fa icon={faChevronDown} size="1x" />
    </div>
    <Tooltip showDelay={300} hideDelay={100} yPos="above">Send Backward in Map</Tooltip>
  </Wrapper>
</div>

<style lang="scss">
  .grouped {
    display: flex;
    justify-content: left;
    align-items: center;
  }
</style>
