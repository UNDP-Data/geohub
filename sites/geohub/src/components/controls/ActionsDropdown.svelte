<script lang="ts">
  import type { LayerSpecification } from 'maplibre-gl'
  import type { LngLatBoundsLike } from 'maplibre-gl'
  import { fade } from 'svelte/transition'
  import { createPopperActions } from 'svelte-popperjs'

  import { LayerTypes } from '$lib/constants'
  import type { Layer, RasterTileMetadata, VectorTileMetadata } from '$lib/types'
  import { map } from '$stores'
  import RasterBandSelector from '$components/controls/RasterBandSelector.svelte'
  import { clickOutside } from 'svelte-use-click-outside'
  import { getLayerStyle } from '$lib/helper'

  export let layer: Layer

  const layerId = layer.id
  const mapLayers = $map.getStyle().layers
  const mapLayerByLayerId = mapLayers.find((item: LayerSpecification) => item.id === layerId)

  let showTooltip = false

  export let mapLayerIndex = mapLayers.indexOf(mapLayerByLayerId)

  const [popperRef, popperContent] = createPopperActions({
    placement: 'right-start',
    strategy: 'fixed',
  })

  const popperOptions = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [-10, 10],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          mainAxis: true,
        },
      },
    ],
  }

  const handleTooltipClick = () => {
    showTooltip = !showTooltip
  }

  const handleZoomToLayerClick = () => {
    let bounds: LngLatBoundsLike
    const layerStyle = getLayerStyle($map, layer.id)
    if (layerStyle.type === LayerTypes.RASTER) {
      const metadata: RasterTileMetadata = layer.info as RasterTileMetadata
      bounds = [
        [Number(metadata.bounds[0]), Number(metadata.bounds[1])],
        [Number(metadata.bounds[2]), Number(metadata.bounds[3])],
      ]
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const metadata: VectorTileMetadata = layer.info
      const boundsArray = metadata.bounds.split(',')
      bounds = [
        [Number(boundsArray[0]), Number(boundsArray[1])],
        [Number(boundsArray[2]), Number(boundsArray[3])],
      ]
    }
    $map.fitBounds(bounds)
    showTooltip = false
  }

  const handleClose = () => {
    showTooltip = false
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      showTooltip = !showTooltip
    }
  }
  const handleZoomKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleZoomToLayerClick()
    }
  }
</script>

<div
  class="icon-selected"
  title="Show Options"
  tabindex="0"
  aria-label="Show Options"
  role="button"
  use:popperRef
  on:click={handleTooltipClick}
  on:keydown={handleKeyDown}
  style="margin-right: 0; cursor: pointer;">
  {#if showTooltip}
    <i class="fa-solid fa-chevron-left" />
  {/if}
  {#if !showTooltip}
    <i class="fa-solid fa-chevron-right" />
  {/if}
</div>

{#if showTooltip}
  <div
    transition:fade
    class="dropdown"
    use:popperContent={popperOptions}
    data-testid="tooltip"
    use:clickOutside={handleClose}>
    <div style="padding-left: 5px;">
      <div
        class="has-tooltip-bottom has-tooltip-arrow"
        data-tooltip="Zoom to layer">
        <div
          class="icon-selected"
          title="Zoom To Layer"
          aria-label="Zoom To Layer"
          tabindex="0"
          role="button"
          on:click={handleZoomToLayerClick}
          on:keydown={handleZoomKeyDown}>
          <i class="fa-solid fa-magnifying-glass fa-sm" />
        </div>
      </div>
    </div>

    <div style="padding-left: 5px;">
      <RasterBandSelector {layer} />
    </div>
  </div>
{/if}

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';

  .dropdown {
    align-items: center;
    background-color: #e3e3e3;
    border-radius: 10px;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: row;
    gap: 10px;
    height: 40px;
    padding: 10px;
    position: absolute;
    right: 40px;
    z-index: 1;
  }
</style>
