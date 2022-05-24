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
      <div class="is-flex is-justify-content-center">Icon</div>
      <div class="is-flex is-justify-content-center bring-to-front">
        <IconImage {layer} />
      </div>
    </div>
    <div class="column is-8">
      <div class="is-flex is-justify-content-center">Size</div>
      <div class="is-flex is-justify-content-center send-to-back">
        <IconSize {layer} />
      </div>
    </div>
  </div>

  <div class="is-divider separator" />

  <div class="columns icon-color-overlap">
    <div class="column color">
      <div class="is-flex is-justify-content-center">Color</div>
      <div class="is-flex is-justify-content-center bring-to-front">
        <IconColor {layer} />
      </div>
    </div>
    <div class="column is-9 overlap-priority">
      <div class="is-flex is-justify-content-center">Overlap Priority</div>
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
    <div class="columns icon-offset" transition:slide={{ duration: 750 }}>
      <div class="column">
        <IconOffset {layer} on:change={handleIconOffset} />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @import '../../styles/bulma-switch.min.css';
  @import '../../styles/bulma-divider.min.css';

  .symbol-simple-container {
    .bring-to-front {
      z-index: 10;
      position: relative;
    }

    .send-to-back {
      z-index: 1;
      position: relative;
    }

    .icon-size {
      margin-bottom: 0;

      .icon-image {
        div:first-child {
          margin-bottom: 10px;
        }

        div:second-child {
          height: 30px;
        }
      }
    }

    .separator {
      margin-top: 0;
      margin-bottom: 25px;
    }

    .icon-color-overlap {
      margin-top: -20px;
      margin-bottom: 0;

      .color {
        margin-right: 25px;

        div:first-child {
          margin-bottom: 5px;
        }
      }

      .overlap-priority {
        margin-right: -25px;

        div:first-child {
          margin: 0;
        }

        div {
          padding-right: 30px;
        }
      }
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
