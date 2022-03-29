<script lang="ts" context="module">
  const dynamicLayerIds = {}
  const layerState = {}
  const sectionState = {}
</script>

<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Dialog, { Title, Content as ContentDialog, Actions as ActionsDialog } from '@smui/dialog'
  import Fa from 'svelte-fa'
  import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
  import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'
  import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash'
  import { faEye } from '@fortawesome/free-solid-svg-icons/faEye'
  import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'

  import { layerList, map } from '../stores'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'

  export let layer: Layer = LayerInitialValues

  const name = layer.name
  const layerId = layer.definition.id
  const mapLayers = $map.getStyle().layers
  const mapLayerByLayerId = mapLayers.filter((item: LayerDefinition) => item.id == layerId).pop()

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

  let confirmDeleteLayerDialogVisible = false
  let isLayerVisible = false
  $: visibility = isLayerVisible ? 'visible' : 'none'

  const toggleVisibility = () => {
    isLayerVisible = !isLayerVisible
    if (!$map.getLayer(layerId)) {
      $map.addLayer(layer.definition)
    }
    $map.setLayoutProperty(layerId, 'visibility', visibility)
  }

  const removeLayer = () => {
    hideLayerControlPanel()

    setTimeout(() => {
      $map.removeLayer(layerId)
      $layerList = $layerList.filter((item) => item.definition.id !== layerId)
      delete layerState[layerId]
      delete sectionState[layerId]
      delete dynamicLayerIds[layerId]
    }, 200)
  }

  const hideLayerControlPanel = () => {
    confirmDeleteLayerDialogVisible = false
  }
</script>

<div class="layer-header-icons">
  <div class="group" style="padding-right: 5px;">
    <div class="icon-selected" title="Move layer up (in map)" on:click={() => hierachyUp(layerId)}>
      <Fa icon={faChevronUp} size="1x" />
    </div>

    <div class="icon-selected" title="Move layer down (in map)" on:click={() => hierachyDown(layerId)}>
      <Fa icon={faChevronDown} size="1x" />
    </div>

    <div class="icon-selected" title="Show/hide layer" on:click={() => toggleVisibility()}>
      <Fa icon={visibility === 'none' ? faEyeSlash : faEye} size="1x" />
    </div>
    <div
      class="icon-selected"
      style="margin-right: 0;"
      title="Delete layer"
      on:click={() => (confirmDeleteLayerDialogVisible = true)}>
      <Fa icon={faTrash} size="1x" />
    </div>
  </div>
</div>

<Dialog bind:open={confirmDeleteLayerDialogVisible}>
  <Title>Delete Layer</Title>
  <ContentDialog>
    Are you sure you want to delete this layer?<br /><br />
    {name}
  </ContentDialog>
  <ActionsDialog>
    <Button>
      <LabelButton>No</LabelButton>
    </Button>
    <Button on:click={() => removeLayer()}>
      <LabelButton>Yes</LabelButton>
    </Button>
  </ActionsDialog>
</Dialog>

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

      .icon {
        opacity: 0.5;
        display: inline;
        cursor: pointer;
        margin-right: 10px;

        &:hover {
          opacity: 1;
        }
      }

      .icon-selected {
        opacity: 1;
        display: inline;
        cursor: pointer;
        margin-right: 10px;
      }
    }
  }
</style>
