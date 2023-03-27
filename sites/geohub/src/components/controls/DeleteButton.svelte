<script lang="ts">
  import { clean, getLayerStyle } from '$lib/helper'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'
  import Modal from '$components/controls/Modal.svelte'

  export let layer: Layer
  import Keydown from 'svelte-keydown'

  let confirmDeleteLayerDialogVisible = false

  const handleDelete = () => {
    const layerId = layer.id
    confirmDeleteLayerDialogVisible = false

    setTimeout(() => {
      const layer = $layerList.filter((item) => item.id === layerId)[0]
      const delSourceId = getLayerStyle($map, layer.id).source
      if (layer.children && layer.children.length > 0) {
        layer.children.forEach((child) => {
          if ($map.getLayer(child.id)) {
            $map.removeLayer(child.id)
          }
        })
        layer.children = []
      }
      $layerList = $layerList.filter((item) => item.id !== layerId)
      if ($map.getLayer(layerId)) {
        $map.removeLayer(layerId)
      }
      const layerListforDelSource = $layerList.filter((item) => getLayerStyle($map, item.id).source === delSourceId)
      if (layerListforDelSource.length === 0) {
        $map.removeSource(delSourceId)
      }
    }, 200)
  }

  const handleCancel = () => {
    confirmDeleteLayerDialogVisible = false
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      confirmDeleteLayerDialogVisible = true
    }
  }
</script>

<Keydown
  paused={!confirmDeleteLayerDialogVisible}
  on:Escape={() => (confirmDeleteLayerDialogVisible = false)} />

<div
  class="has-tooltip-bottom has-tooltip-arrow"
  data-testid="delete-button"
  data-tooltip="Delete layer">
  <div
    class="container icon-selected"
    data-testid="delete-button-container"
    tabindex="0"
    role="button"
    on:click={() => (confirmDeleteLayerDialogVisible = true)}
    on:keydown={handleKeyDown}>
    <i
      data-testid="delete-icon"
      class="fa-solid fa-trash fa-sm" />
  </div>
</div>
<Modal
  bind:dialogOpen={confirmDeleteLayerDialogVisible}
  on:cancel={handleCancel}
  on:continue={handleDelete}
  title="Delete Layer"
  message="Are you sure you want to delete this layer?"
  target={clean(layer.name)}
  cancelText="Cancel"
  continueText="Delete" />

<style lang="scss">
  .footer-button {
    width: 150px;
  }
</style>
