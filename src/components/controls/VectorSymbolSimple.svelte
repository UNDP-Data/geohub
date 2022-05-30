<script lang="ts">
  import { slide } from 'svelte/transition'

  import IconColor from '$components/controls/vector-styles/IconColor.svelte'
  import IconImage from '$components/controls/vector-styles/IconImage.svelte'
  import IconOverlap from '$components/controls/vector-styles/IconOverlap.svelte'
  import IconSize from '$components/controls/vector-styles/IconSize.svelte'
  import IconOffset from '$components/controls/vector-styles/IconOffset.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id

  let iconOffSetValueEdited = false
  let isAdvancedSettings = false

  const handleIconOffset = () => {
    iconOffSetValueEdited = true
  }

  $: {
    if (isAdvancedSettings === false && iconOffSetValueEdited) {
      $map.setLayoutProperty(layerId, 'icon-offset', [0, 0])
    }
  }
</script>

<div class="symbol-simple-container">
  <div class="columns icon-size">
    <div class="column is-4 icon-image">
      <div class="has-text-centered pb-2">Icon</div>
      <div class="is-flex is-justify-content-center bring-to-front">
        <IconImage {layer} />
      </div>
    </div>
    <div class="column is-8">
      <div class="has-text-centered">Size</div>
      <div class="is-flex is-justify-content-center send-to-back">
        <IconSize {layer} />
      </div>
    </div>
  </div>

  <div class="is-divider separator mt-3 mb-3" style="margin-right: -56px;" />

  <div class="columns icon-color-overlap" style="margin-right: -56px;">
    <div class="column color">
      <div class="has-text-centered pb-2">Color</div>
      <div class="is-flex is-justify-content-center bring-to-front">
        <IconColor {layer} />
      </div>
    </div>
    <div class="column is-9 overlap-priority">
      <div class="has-text-centered">Overlap Priority</div>
      <div class="is-flex is-justify-content-center send-to-back">
        <IconOverlap {layer} />
      </div>
    </div>
  </div>

  <div class="columns advanced-settings">
    <div class="column">
      <div class="field">
        <input
          id="switchAdvancedSettings"
          type="checkbox"
          name="switchSmall"
          class="switch is-small is-rounded is-info"
          bind:checked={isAdvancedSettings} />
        <label for="switchAdvancedSettings" class="is-size-6">Advanced Settings</label>
      </div>
    </div>
  </div>

  {#if isAdvancedSettings}
    <div class="columns icon-offset pb-4" transition:slide={{ duration: 750 }}>
      <div class="column">
        <IconOffset {layer} on:change={handleIconOffset} />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .symbol-simple-container {
    .bring-to-front {
      z-index: 10;
      position: relative;
    }

    .send-to-back {
      z-index: 1;
      position: relative;
    }

    .advanced-settings {
      padding-left: 5px;

      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .icon-offset {
      margin-right: -48px;
      padding-left: 15px;

      div:first-child {
        border: 1px solid #ccc;
        padding: 0;
        padding-top: 5px;
      }
    }
  }
</style>
