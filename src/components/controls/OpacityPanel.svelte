<script lang="ts">
  import Fa from 'svelte-fa'
  import { slide } from 'svelte/transition'
  import RangeSlider from 'svelte-range-slider-pips'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { map } from '../../stores'
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues, LayerTypes } from '../../lib/constants'

  export let layer: Layer = LayerInitialValues
  export let isOpacityPanelVisible = false

  const layerId = layer.definition.id

  let layerOpacity = 1
  let rangeSliderValues = [layerOpacity * 100]

  $: layerOpacity = rangeSliderValues[0] / 100
  $: layerOpacity, setLayerOpacity()

  const setLayerOpacity = () => {
    if (layer.definition.type === LayerTypes.RASTER) {
      $map.setPaintProperty(layerId, 'raster-opacity', layerOpacity)
    } else {
      switch (layer.definition.type) {
        case 'symbol':
          $map.setPaintProperty(layerId, 'icon-opacity', layerOpacity)
          $map.setPaintProperty(layerId, 'text-opacity', layerOpacity)
          break
        case 'line':
          $map.setPaintProperty(layerId, 'line-opacity', layerOpacity)
          break
        case 'fill':
          $map.setPaintProperty(layerId, 'fill-opacity', layerOpacity)
          break
        default:
          break
      }
    }
  }
</script>

{#if isOpacityPanelVisible === true}
  <div transition:slide class="action">
    <div class="header">
      <div class="name">Opacity</div>
      <div class="close icon-selected" on:click={() => (isOpacityPanelVisible = false)} title="Close">
        <Fa icon={faXmark} size="lg" />
      </div>
    </div>
    <div class="slider">
      <RangeSlider
        bind:values={rangeSliderValues}
        float
        min={0}
        max={100}
        step={1}
        pips
        first="label"
        last="label"
        rest={false}
        suffix="%" />
    </div>
  </div>
{/if}

<style lang="scss">
  .action {
    margin-bottom: 25px;

    .slider {
      --range-handle-focus: #2196f3;
      --range-range-inactive: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
    }

    .header {
      display: flex;
      justify-content: left;
      align-items: center;
      margin-top: 15px;
      background: #f0f0f0;
      border-radius: 7.5px;
      padding: 2.5px;
      padding-left: 7.5px;
      margin-bottom: 10px;

      .name {
        width: 100%;
      }

      .close {
        cursor: pointer;
        padding-right: 5px;
      }
    }
  }
</style>
