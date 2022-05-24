<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues
  export let isOpacityPanelVisible = false

  let layerOpacity = 1
  let rangeSliderValues = [layerOpacity * 100]

  $: layerOpacity = rangeSliderValues[0] / 100
  $: layerOpacity, setOpacity()

  const setOpacity = () => {
    layer.children?.forEach((child: Layer) => {
      setLayerOpacity(child)
    })
    setLayerOpacity(layer)
  }

  const setLayerOpacity = (target: Layer) => {
    const id = target.definition.id
    if (target.definition.type === LayerTypes.RASTER) {
      $map.setPaintProperty(id, 'raster-opacity', layerOpacity)
    } else {
      switch (target.definition.type) {
        case LayerTypes.SYMBOL:
          $map.setPaintProperty(id, 'icon-opacity', layerOpacity)
          $map.setPaintProperty(id, 'text-opacity', layerOpacity)
          break
        case LayerTypes.LINE:
          $map.setPaintProperty(id, 'line-opacity', layerOpacity)
          break
        case LayerTypes.FILL:
          $map.setPaintProperty(id, 'fill-opacity', layerOpacity)
          break
        case LayerTypes.HEATMAP:
          $map.setPaintProperty(id, 'heatmap-opacity', layerOpacity)
          break
        default:
          break
      }
    }
  }
</script>

{#if isOpacityPanelVisible === true}
  <div class="action" data-testid="opacity-panel-container">
    <div class="range-slider">
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

    .range-slider {
      --range-handle-focus: #2196f3;
      --range-range-inactive: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
    }
  }
</style>
