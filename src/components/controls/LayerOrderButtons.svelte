<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import type { LayerSpecification } from 'maplibre-gl'
  import Fa from 'svelte-fa'
  import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
  import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'

  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

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

  const handleUpKeyEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      hierachyUp(layerId)
    }
  }

  const handleDownKeyEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      hierachyDown(layerId)
    }
  }
</script>

<div class="grouped">
  <Wrapper>
    <div
      class="icon-selected"
      title="Bring Layer Up"
      aria-label="Bring Layer Up"
      tabindex="0"
      role="button"
      on:click={() => hierachyUp(layerId)}
      on:keydown={handleUpKeyEnter}>
      <Fa class="arrow-icon" icon={faChevronUp} size="1x" />
    </div>
    <Tooltip showDelay={300} hideDelay={100} yPos="above">Bring Forward in Map</Tooltip>
  </Wrapper>
  <div style="width: 10px" />
  <Wrapper>
    <div
      class="icon-selected"
      title="Bring Layer Down"
      aria-label="Bring Layer Down"
      tabindex="0"
      on:click={() => hierachyDown(layerId)}
      on:keydown={handleDownKeyEnter}>
      <Fa class="arrow-icon" icon={faChevronDown} size="1x" />
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
  :global(.icon-selected):hover {
    //background: #aaaaaa;
    cursor: pointer;
  }
  :global(.arrow-icon) {
    color: grey !important;
  }
  :global(.arrow-icon):hover {
    color: black !important;
  }

  :global(.arrow-icon):focus {
    color: black !important;
  }
</style>
