<script lang="ts">
  import type { LayerSpecification } from 'maplibre-gl'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.id
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
  <div
    class="has-tooltip-bottom"
    data-tooltip="Bring Forward in Map">
    <div
      class="icon-selected"
      title="Bring Layer Up"
      aria-label="Bring Layer Up"
      tabindex="0"
      role="button"
      on:click={() => hierachyUp(layerId)}
      on:keydown={handleUpKeyEnter}>
      <i class="arrow-icon fa-solid fa-chevron-up" />
    </div>
  </div>
  <div
    class="pl-2 has-tooltip-bottom"
    data-tooltip="Bring Backward in Map">
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div
      class="icon-selected"
      title="Bring Layer Down"
      aria-label="Bring Layer Down"
      tabindex="0"
      on:click={() => hierachyDown(layerId)}
      on:keydown={handleDownKeyEnter}>
      <i class="arrow-icon fa-solid fa-chevron-down" />
    </div>
  </div>
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
