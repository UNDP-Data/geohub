<script lang="ts" context="module">
  const dynamicLayerIds = {}
</script>

<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'

  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Tag from 'svelma/src/components/Tag/Tag.svelte'
  import { slide } from 'svelte/transition'
  import Fa from 'svelte-fa'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck'
  import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare'

  import LayerOrderButtons from '../controls/LayerOrderButtons.svelte'
  import { LayerInitialValues } from '../../lib/constants'
  import { dynamicLayers, layerList, map } from '../../stores'
  import type { Layer } from '../../lib/types'

  export let layer: Layer = LayerInitialValues
  export let disabled = true

  const layerId = layer.definition.id
  const mapLayers = $map.getStyle().layers
  const mapLayerByLayerId = mapLayers.find((item: LayerSpecification) => item.id === layerId)

  let mapLayerLength = mapLayers.length - 1
  let menuOpen = false
  let isDynamicLayer: boolean = dynamicLayerIds[layerId] || false

  export let mapLayerIndex = mapLayers.indexOf(mapLayerByLayerId)

  $: isDynamicLayer, setDynamicLayerState()

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
</script>

<Wrapper>
  <div class="icon-selected" on:click={() => (menuOpen = !menuOpen)}>
    <Fa
      icon={faChevronRight}
      size="1x"
      style={`cursor: pointer;${menuOpen === true ? 'transform: rotate(180deg);' : ''}`} />
  </div>
  <Tooltip showDelay={300} hideDelay={100} yPos="above"
    >{menuOpen ? 'Hide Actions Panel' : 'Show Actions Panel'}</Tooltip>
</Wrapper>

{#if menuOpen}
  <div transition:slide class="dropdown">
    <div>
      <Tag type="is-info" size="is-small">{mapLayerIndex} / {mapLayerLength}</Tag>
    </div>
    <div style="padding-left: 5px;">
      <LayerOrderButtons {layer} bind:mapLayerIndex />
    </div>

    {#if $layerList.length > 1}
      <Wrapper>
        <div class="icon-selected" on:click={() => (isDynamicLayer = !isDynamicLayer)}>
          <Fa icon={isDynamicLayer ? faSquareCheck : faSquare} size="1x" />
        </div>
        <Tooltip showDelay={300} hideDelay={100} yPos="above">Merge Layers</Tooltip>
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
    z-index: 10;
    margin-left: 80px;

    @media (prefers-color-scheme: dark) {
      background: #323234;
      border-color: #30363d;
      color: white;
    }
  }
</style>
