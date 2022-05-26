<script lang="ts" context="module">
  const dynamicLayerIds = {}
</script>

<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import type { LngLatBoundsLike } from 'maplibre-gl'
  import Tag from 'svelma/src/components/Tag/Tag.svelte'
  import { fade } from 'svelte/transition'
  import Fa from 'svelte-fa'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck'
  import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare'
  import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass'
  import { createPopperActions } from 'svelte-popperjs'

  import LayerOrderButtons from '$components/controls/LayerOrderButtons.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer, RasterTileMetadata, VectorTileMetadata } from '$lib/types'
  import { dynamicLayers, layerList, map } from '$stores'

  export let layer: Layer = LayerInitialValues
  export let disabled = true

  const layerId = layer.definition.id
  const mapLayers = $map.getStyle().layers
  const mapLayerByLayerId = mapLayers.find((item: LayerSpecification) => item.id === layerId)

  let isDynamicLayer: boolean = dynamicLayerIds[layerId] || false
  let mapLayerLength = mapLayers.length - 1
  let showTooltip = false

  $: isDynamicLayer, setDynamicLayerState()

  export let mapLayerIndex = mapLayers.indexOf(mapLayerByLayerId)

  const setDynamicLayerState = () => {
    dynamicLayerIds[layerId] = isDynamicLayer

    if (isDynamicLayer === true) {
      if (!$dynamicLayers.includes(layerId)) {
        dynamicLayers.set([...$dynamicLayers, layerId])
      }
    } else {
      $dynamicLayers = $dynamicLayers.filter((dynamicLayerId) => dynamicLayerId !== layerId)
    }

    let ntrue = 0

    for (const [value] of Object.entries(dynamicLayerIds)) {
      if (value) {
        ++ntrue
      }
      if (ntrue >= 2) {
        disabled = false
        break
      } else {
        disabled = true
      }
    }
  }

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
    if (layer.type === LayerTypes.RASTER) {
      const metadata: RasterTileMetadata = layer.info
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
</script>

<div class="icon-selected" use:popperRef on:click={handleTooltipClick} style="margin-right: 0; cursor: pointer;">
  <Fa icon={faChevronRight} size="sm" />
</div>

{#if showTooltip}
  <div transition:fade class="dropdown" use:popperContent={popperOptions} data-testid="tooltip">
    <div style="padding-left: 5px;">
      <Wrapper>
        <div class="icon-selected" on:click={handleZoomToLayerClick}>
          <Fa icon={faMagnifyingGlass} size="sm" />
        </div>
        <Tooltip showDelay={500} hideDelay={500} yPos="above">Zoom to layer</Tooltip>
      </Wrapper>
    </div>

    <div>
      <Tag type="is-info" size="is-small">
        {mapLayerIndex} / {mapLayerLength}
      </Tag>
    </div>
    <div style="padding-left: 5px;">
      <LayerOrderButtons {layer} bind:mapLayerIndex />
    </div>

    {#if layer.type === LayerTypes.RASTER && $layerList.length > 1}
      <Wrapper>
        <div class="icon-selected" on:click={() => (isDynamicLayer = !isDynamicLayer)}>
          <Fa icon={isDynamicLayer ? faSquareCheck : faSquare} size="sm" />
        </div>
        <Tooltip showDelay={500} hideDelay={500} yPos="above">Merge Layers</Tooltip>
      </Wrapper>
    {/if}
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

    @media (prefers-color-scheme: dark) {
      background: #323234;
      border-color: #30363d;
      color: white;
    }
  }
</style>
