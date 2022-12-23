<script lang="ts">
  import { fade } from 'svelte/transition'
  import { clickOutside } from 'svelte-use-click-outside'

  import { clean, getLayerStyle } from '$lib/helper'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'

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
          $map.removeLayer(child.id)
        })
        layer.children = []
      }
      $layerList = $layerList.filter((item) => item.id !== layerId)
      $map.removeLayer(layerId)
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
  data-tooltip="Delete layer">
  <div
    class="container icon-selected"
    tabindex="0"
    role="button"
    title="Delete layer"
    aria-label="Delete layer"
    on:click={() => (confirmDeleteLayerDialogVisible = true)}
    on:keydown={handleKeyDown}>
    <i class="fa-solid fa-trash fa-sm" />
  </div>
</div>

{#if confirmDeleteLayerDialogVisible}
  <div
    class="modal is-active"
    data-testid="delete-layer-view-container"
    transition:fade
    use:clickOutside={handleCancel}>
    <div class="modal-background" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Delete Layer</p>
        <button
          class="delete"
          aria-label="close"
          alt="Close Delete Layer Button"
          title="Close Delete Layer Button"
          on:click={handleCancel} />
      </header>
      <section class="modal-card-body is-size-6 has-text-weight-normal">
        <div class="has-text-weight-medium">Are you sure you want to delete this layer?</div>
        <br />
        {clean(layer.name)}
      </section>
      <footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
        <div>
          <button
            class="button secondary-button"
            alt="Cancel Delete Layer Button"
            title="Cancel Delete Layer Button"
            on:click={handleCancel}>
            Cancel
          </button>

          <button
            class="button primary-button"
            alt="Delete Layer Button"
            title="Delete Layer Button"
            on:click={handleDelete}>Delete</button>
        </div>
      </footer>
    </div>
  </div>
{/if}

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';

  .modal {
    .modal-card {
      width: 450px;
    }
  }
</style>
