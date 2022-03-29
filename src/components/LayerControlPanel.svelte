<script lang="ts">
  import Fa from 'svelte-fa'
  import { faToggleOn } from '@fortawesome/free-solid-svg-icons/faToggleOn'
  import { faToggleOff } from '@fortawesome/free-solid-svg-icons/faToggleOff'
  import { cloneDeep } from 'lodash'

  import { layerList } from '../stores'
  import type { Layer } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import DeleteButton from './controls/DeleteButton.svelte'
  import VisibilityButton from './controls/VisibilityButton.svelte'
  import LayerOrderButtons from './controls/LayerOrderButtons.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id

  export let mapLayerIndex

  let queryInfoEnabled = true

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
    <LayerOrderButtons {layer} bind:mapLayerIndex />
    <VisibilityButton {layer} />
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
