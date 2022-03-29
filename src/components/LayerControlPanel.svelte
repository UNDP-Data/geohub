<script lang="ts">
  import Fa from 'svelte-fa'
  import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
  import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'
  import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash'
  import { faEye } from '@fortawesome/free-solid-svg-icons/faEye'
  import { faToggleOn } from '@fortawesome/free-solid-svg-icons/faToggleOn'
  import { faToggleOff } from '@fortawesome/free-solid-svg-icons/faToggleOff'
  import { cloneDeep } from 'lodash'

  import { layerList, map } from '../stores'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import DeleteButton from './controls/DeleteButton.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const mapLayers = $map.getStyle().layers
  const mapLayerByLayerId = mapLayers.find((item: LayerDefinition) => item.id === layerId)

  export let mapLayerIndex = mapLayers.indexOf(mapLayerByLayerId)

  let queryInfoEnabled = true
  let isLayerVisible = false

  $: visibility = isLayerVisible ? 'visible' : 'none'

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

  const toggleVisibility = () => {
    isLayerVisible = !isLayerVisible
    if (!$map.getLayer(layerId)) {
      $map.addLayer(layer.definition)
    }
    $map.setLayoutProperty(layerId, 'visibility', visibility)
  }

  const setQueryInfoEnabled = () => {
    const layerClone = cloneDeep(layer)
    layerClone.queryInfoEnabled = !queryInfoEnabled
    const layerIndex = $layerList.findIndex((layer) => layer.definition.id === layerId)
    $layerList[layerIndex] = layerClone
    queryInfoEnabled = !queryInfoEnabled
  }
</script>

<div class="layer-header-icons">
  <div class="group" style="padding-right: 5px;">
    <div title="Query Map Info" class="icon-selected" on:click={() => setQueryInfoEnabled()}>
      <Fa icon={queryInfoEnabled ? faToggleOn : faToggleOff} size="1x" />
    </div>

    <div class="icon-selected" title="Move layer up (in map)" on:click={() => hierachyUp(layerId)}>
      <Fa icon={faChevronUp} size="1x" />
    </div>

    <div class="icon-selected" title="Move layer down (in map)" on:click={() => hierachyDown(layerId)}>
      <Fa icon={faChevronDown} size="1x" />
    </div>

    <div class="icon-selected" title="Show/hide layer" on:click={() => toggleVisibility()}>
      <Fa icon={visibility === 'none' ? faEyeSlash : faEye} size="1x" />
    </div>
    <DeleteButton {layer} />
  </div>
</div>

<style lang="scss">
  .layer-header-icons {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 15px;

    .group {
      background: #f0f0f0;
      border-radius: 7.5px;
      padding: 5px;
      padding-right: 0;

      .icon-selected {
        opacity: 1;
        display: inline;
        cursor: pointer;
        margin-right: 10px;
      }
    }
  }
</style>
