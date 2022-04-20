<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'

  import { map } from '../../stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'

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
        case LayerTypes.SYMBOL:
          $map.setPaintProperty(layerId, 'icon-opacity', layerOpacity)
          $map.setPaintProperty(layerId, 'text-opacity', layerOpacity)
          break
        case LayerTypes.LINE:
          $map.setPaintProperty(layerId, 'line-opacity', layerOpacity)
          break
        case LayerTypes.FILL:
          $map.setPaintProperty(layerId, 'fill-opacity', layerOpacity)
          break
        case LayerTypes.HEATMAP:
          $map.setPaintProperty(layerId, 'heatmap-opacity', layerOpacity)
          break
        default:
          break
      }
    }
  }
</script>

{#if isOpacityPanelVisible === true}
  <div class="action">
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
  }
</style>
